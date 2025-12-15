"""
Validadores de Reglas de Negocio
OWASP A03 - Validación de Entradas
NIST 800-53 - IA-5 Autenticación
"""
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _
import re


class BusinessRuleValidator:
    """Validador base para reglas de negocio"""

    @staticmethod
    def validate_rut_chileno(rut):
        """
        Valida RUT chileno con dígito verificador
        Formato: 12345678-9 o 12.345.678-9
        """
        # Limpiar formato
        rut = str(rut).replace('.', '').replace('-', '').upper()

        if len(rut) < 2:
            raise ValidationError(_('RUT inválido'))

        rut_num = rut[:-1]
        dv = rut[-1]

        if not rut_num.isdigit():
            raise ValidationError(_('RUT debe contener solo números'))

        # Calcular dígito verificador
        suma = 0
        multiplo = 2

        for digit in reversed(rut_num):
            suma += int(digit) * multiplo
            multiplo += 1
            if multiplo == 8:
                multiplo = 2

        resto = suma % 11
        dv_calculado = 11 - resto

        if dv_calculado == 11:
            dv_calculado = '0'
        elif dv_calculado == 10:
            dv_calculado = 'K'
        else:
            dv_calculado = str(dv_calculado)

        if dv != dv_calculado:
            raise ValidationError(_('Dígito verificador de RUT inválido'))

        return True

    @staticmethod
    def validate_monto(monto, min_valor=0, max_valor=999999999):
        """
        Valida montos tributarios
        OWASP A03 - Prevenir overflow y valores negativos
        """
        try:
            monto_float = float(monto)
        except (ValueError, TypeError):
            raise ValidationError(_('Monto debe ser un número válido'))

        if monto_float < min_valor:
            raise ValidationError(_(f'Monto no puede ser menor a {min_valor}'))

        if monto_float > max_valor:
            raise ValidationError(_(f'Monto no puede ser mayor a {max_valor}'))

        # Validar máximo 2 decimales
        if len(str(monto_float).split('.')[-1]) > 2:
            raise ValidationError(_('Monto debe tener máximo 2 decimales'))

        return True

    @staticmethod
    def validate_periodo_tributario(periodo):
        """
        Valida período tributario (AAAA-MM)
        Formato: 2024-01
        """
        pattern = r'^(19|20)\d{2}-(0[1-9]|1[0-2])$'
        if not re.match(pattern, str(periodo)):
            raise ValidationError(_('Período debe tener formato AAAA-MM'))

        return True

    @staticmethod
    def validate_file_extension(filename, allowed_extensions):
        """
        Valida extensión de archivo
        OWASP A04 - Prevenir upload de archivos peligrosos
        """
        ext = filename.split('.')[-1].lower()
        if ext not in allowed_extensions:
            raise ValidationError(
                _(f'Extensión .{ext} no permitida. Permitidas: {", ".join(allowed_extensions)}')
            )
        return True

    @staticmethod
    def validate_file_size(file_size, max_mb=10):
        """
        Valida tamaño de archivo
        OWASP A04 - Prevenir DoS por archivos grandes
        """
        max_bytes = max_mb * 1024 * 1024
        if file_size > max_bytes:
            raise ValidationError(_(f'Archivo no puede superar {max_mb}MB'))
        return True

    @staticmethod
    def validate_csv_structure(csv_data, required_columns):
        """
        Valida estructura de CSV
        OWASP A03 - Validación de formato
        """
        if not csv_data:
            raise ValidationError(_('CSV vacío'))

        headers = csv_data[0] if csv_data else []
        missing = set(required_columns) - set(headers)

        if missing:
            raise ValidationError(
                _(f'Columnas faltantes en CSV: {", ".join(missing)}')
            )

        return True

    @staticmethod
    def validate_state_transition(estado_actual, estado_nuevo, transiciones_validas):
        """
        Valida transición de estados
        NIST 800-53 AC - Control de flujo de trabajo
        """
        transiciones_permitidas = transiciones_validas.get(estado_actual, [])

        if estado_nuevo not in transiciones_permitidas:
            raise ValidationError(
                _(f'Transición de {estado_actual} a {estado_nuevo} no permitida')
            )

        return True


# Diccionario de transiciones de estado válidas
TRANSICIONES_CALIFICACION = {
    'BORRADOR': ['PENDIENTE'],
    'PENDIENTE': ['VALIDADA', 'RECHAZADA', 'OBSERVADA'],
    'OBSERVADA': ['BORRADOR', 'PENDIENTE'],
    'VALIDADA': [],  # Estado final
    'RECHAZADA': [],  # Estado final
}


class SecurityValidator:
    """Validadores de seguridad adicionales"""

    @staticmethod
    def validate_no_sql_injection(text):
        """
        Detecta patrones sospechosos de SQL injection
        OWASP A03 - Aunque DRF ORM protege, validación adicional
        """
        dangerous_patterns = [
            r"(?i)(union|select|insert|update|delete|drop|create|alter)\s+",
            r"(?i)(;|--|\*|xp_)",
            r"(?i)(exec|execute|script|javascript)",
        ]

        for pattern in dangerous_patterns:
            if re.search(pattern, str(text)):
                raise ValidationError(_('Contenido sospechoso detectado'))

        return True

    @staticmethod
    def validate_no_xss(text):
        """
        Detecta patrones XSS básicos
        OWASP A03 - React escapa por defecto, pero validación adicional
        """
        dangerous_patterns = [
            r"<script[^>]*>.*?</script>",
            r"javascript:",
            r"on\w+\s*=",
            r"<iframe",
        ]

        for pattern in dangerous_patterns:
            if re.search(pattern, str(text), re.IGNORECASE):
                raise ValidationError(_('Contenido sospechoso detectado'))

        return True

    @staticmethod
    def validate_strong_password(password):
        """
        Valida fortaleza de contraseña
        NIST 800-63B - Contraseña robusta
        """
        if len(password) < 8:
            raise ValidationError(_('Contraseña debe tener mínimo 8 caracteres'))

        if not re.search(r'[A-Z]', password):
            raise ValidationError(_('Contraseña debe tener al menos una mayúscula'))

        if not re.search(r'[a-z]', password):
            raise ValidationError(_('Contraseña debe tener al menos una minúscula'))

        if not re.search(r'[0-9]', password):
            raise ValidationError(_('Contraseña debe tener al menos un número'))

        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
            raise ValidationError(_('Contraseña debe tener al menos un carácter especial'))

        # Validar contra contraseñas comunes
        common_passwords = ['password', '12345678', 'qwerty', 'admin123']
        if password.lower() in common_passwords:
            raise ValidationError(_('Contraseña muy común, elija otra'))

        return True
