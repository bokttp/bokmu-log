# 구간별 내레이션을 Windows 한국어 음성(Heami)으로 WAV 파일로 만들고, 길이(ms)를 durations.json에 적는다
$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Speech
$dir = $PSScriptRoot
New-Item -ItemType Directory -Force "$dir\audio" | Out-Null
$segments = Get-Content -Raw -Encoding UTF8 "$dir\segments.json" | ConvertFrom-Json
$durations = @{}
foreach ($s in $segments) {
  $synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
  $synth.SelectVoice("Microsoft Heami Desktop")
  $synth.Rate = 1
  $wav = "$dir\audio\$($s.id).wav"
  $synth.SetOutputToWaveFile($wav)
  $synth.Speak($s.text)
  $synth.Dispose()
  $reader = New-Object System.IO.FileStream($wav, [System.IO.FileMode]::Open)
  $bytes = $reader.Length
  $reader.Close()
  # 22050Hz 16bit mono 기본 출력이 아닐 수 있어 ffprobe로 정확히 잰다
  $sec = & ffprobe -v error -show_entries format=duration -of csv=p=0 $wav
  $durations[$s.id] = [int]([double]$sec * 1000)
}
$durations | ConvertTo-Json | Out-File -Encoding utf8 "$dir\durations.json"
$durations.GetEnumerator() | Sort-Object Name | ForEach-Object { "$($_.Name) $($_.Value)ms" }
