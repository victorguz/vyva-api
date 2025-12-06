# Autenticación con GitHub CLI (gh) para GitHub Packages

## Instalación de GitHub CLI

### Windows (con winget o Chocolatey)

**Opción 1: Con winget (Windows Package Manager)**

```powershell
winget install --id GitHub.cli
```

**Opción 2: Con Chocolatey**

```powershell
choco install gh
```

**Opción 3: Descargar manualmente**

- Ve a: https://github.com/cli/cli/releases/latest
- Descarga `gh_*.msi` para Windows
- Instala el ejecutable

## Autenticación con GitHub CLI

Una vez instalado GitHub CLI:

### 1. Autenticarse con GitHub

```powershell
gh auth login
```

Esto te preguntará:

- **GitHub.com** o GitHub Enterprise Server → Selecciona GitHub.com
- **Protocol**: HTTPS (recomendado) o SSH
- **Authenticate Git with your GitHub credentials?** → Yes (opcional pero útil)
- Se abrirá el navegador para autenticarte

### 2. Obtener el token para npm

GitHub CLI guarda un token automáticamente. Puedes obtenerlo así:

```powershell
gh auth token
```

Este comando mostrará el token que GitHub CLI está usando.

### 3. Configurar npm con el token de gh CLI

**Opción A: Usar el token directamente (temporal)**

```powershell
$env:GITHUB_TOKEN = gh auth token
```

**Opción B: Configurar permanentemente**

```powershell
$token = gh auth token
[System.Environment]::SetEnvironmentVariable('GITHUB_TOKEN', $token, 'User')
```

**Opción C: Configurar en .npmrc directamente**

```powershell
$token = gh auth token
Add-Content -Path .npmrc -Value "//npm.pkg.github.com/:_authToken=$token"
```

### 4. Configurar scopes del token (si necesitas más permisos)

Si necesitas permisos adicionales como `read:packages` o `write:packages`, puedes refrescar el token con esos scopes:

```powershell
gh auth refresh -s read:packages,write:packages
```

Luego obtén el nuevo token:

```powershell
gh auth token
```

## Ventajas de usar GitHub CLI

✅ **Más fácil**: Solo un comando `gh auth login`
✅ **Automático**: El token se renueva automáticamente
✅ **Seguro**: No necesitas copiar/pegar tokens manualmente
✅ **Integrado**: Funciona bien con otros comandos de gh

## Verificar autenticación

```powershell
gh auth status
```

Esto mostrará:

- Tu usuario de GitHub
- Estado de autenticación
- Scopes del token actual

## Comandos útiles

```powershell
# Ver el token actual
gh auth token

# Ver estado de autenticación
gh auth status

# Refrescar el token con nuevos scopes
gh auth refresh -s read:packages,write:packages

# Cerrar sesión
gh auth logout
```

## Configurar npm automáticamente

Puedes crear un script PowerShell para configurar npm automáticamente:

```powershell
# setup-gh-npm.ps1
$token = gh auth token
if ($token) {
    $env:GITHUB_TOKEN = $token
    Write-Host "✅ GITHUB_TOKEN configurado correctamente"
    Write-Host "Ejecuta: npm install"
} else {
    Write-Host "❌ Error: No se pudo obtener el token. Ejecuta: gh auth login"
}
```

Guardalo como `setup-gh-npm.ps1` y ejecútalo antes de `npm install`.
