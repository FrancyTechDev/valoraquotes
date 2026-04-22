

# Migliorare il riconoscimento vocale

## Problema
Il `VoiceRecorder` usa `recognition.lang = "en-US"`, quindi il riconoscimento vocale del browser prova a interpretare tutto come inglese. Inoltre, l'API nativa del browser ha una precisione limitata.

## Piano

### 1. Rilevamento automatico della lingua e selezione manuale
- Impostare `recognition.lang` in base a `navigator.language` (es. `it-IT` per utenti italiani)
- Aggiungere un selettore lingua semplice (IT, EN, ES, FR, DE) sopra il pulsante di registrazione

### 2. Migliorare la gestione dei risultati
- Usare `interimResults = true` per mostrare il testo in tempo reale durante la registrazione
- Gestire correttamente i risultati finali vs parziali
- Mostrare un feedback visivo del testo riconosciuto durante la registrazione

### 3. Aggiungere gestione errori migliore
- Mostrare messaggi chiari per errori del microfono (permesso negato, microfono non trovato)
- Gestire il caso `no-speech` con messaggio dedicato

## File modificati
- `src/components/VoiceRecorder.tsx` — lingua dinamica, risultati interim, gestione errori
- `src/routes/index.tsx` — passare la lingua selezionata al recorder

## Alternativa futura
Se la qualità resta insufficiente, si puo integrare ElevenLabs Scribe (richiede API key) per trascrizione server-side di alta qualita. Per ora, il fix della lingua dovrebbe risolvere il problema principale.

