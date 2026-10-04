# AGENTS.md

## ATURAN KRITIS: JANGAN PERNAH KILL SEMUA PROSES NODE

9Router (AI gateway yang dipakai opencode sebagai provider, port 20128) berjalan
sebagai `node.exe`. Perintah berikut **DILARANG** dan sudah diblokir via
`permission.bash` deny-rule di `~/.config/opencode/opencode.json`:

- `Stop-Process -Name node` (varian apa pun)
- `taskkill ... node.exe` / `taskkill /im node`
- `killall node`

Perintah itu membunuh 9Router → semua request AI gagal → sesi terasa "mati tiap prompt".

## Workflow build/test yang BENAR

```powershell
npm run test          # = npm run build && playwright test
```

- EBUSY pada `dist` sudah ditangani `build.mjs` (`rm` dengan `maxRetries: 5,
  retryDelay: 150`). TIDAK perlu kill node apa pun.
- Kalau `dist` masih terkunci, pastikan tidak ada `serve.mjs` yang berjalan lalu
  ulangi; bunuh **hanya PID spesifik** proses serve itu:
  ```powershell
  Get-CimInstance Win32_Process -Filter "Name='node.exe'" |
    Where-Object { $_.CommandLine -match 'serve\.mjs' } |
    ForEach-Object { Stop-Process -Id $_.ProcessId -Force }
  ```
- PowerShell 5.1: jangan pakai `&&`; gunakan `;` atau `if ($?)`.

## Menjalankan/memeriksa 9Router

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File "C:\Users\LENOVO\.9router-tools\9router-safe.ps1" -Status
powershell -NoProfile -ExecutionPolicy Bypass -File "C:\Users\LENOVO\.9router-tools\9router-safe.ps1" -Restart
```

- JANGAN menjalankan `9router` polos (foreground TUI) — cli.js memanggil
  `killAllAppProcesses()` yang membunuh instance yang sedang berjalan.
- Detail lengkap: `C:\Users\LENOVO\.9router-tools\README.md`
