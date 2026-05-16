# VibingEcho

Site estatico para recomendar musicas parecidas usando o catalogo publico do iTunes.
Nao precisa de backend, banco manual, Java, Node ou chave de API.

## Como funciona

- O usuario digita uma musica ou artista.
- O site consulta `https://itunes.apple.com/search` sem precisar de chave de API.
- A faixa de referencia e escolhida entre os melhores resultados.
- O app busca candidatos por artista, genero, album e pistas de sensacao.
- As recomendacoes sao ranqueadas por genero, sensacao, artista, duracao, epoca e palavras em comum.
- O navegador guarda um cache local por 24 horas para evitar chamadas repetidas.

## Subir no Vercel

1. Envie estes arquivos para um repositorio GitHub.
2. No Vercel, importe o repositorio.
3. Framework preset: `Other`.
4. Build command: deixe vazio.
5. Output directory: deixe vazio ou use `.`.

## Rodar pelo terminal

```bash
cd /Users/diogoaiub/Documents/Codex/2026-05-16/estou-fazendo-um-site-ja-tenho
python3 -m http.server 8080
```

Depois abra:

```text
http://localhost:8080
```

## Observacao importante

A API do iTunes nao entrega analise real de audio, como BPM, energia ou valencia.
Por isso, este projeto usa metadados publicos do iTunes e uma heuristica de
"sensacao". Para recomendacao musical ainda mais precisa, o proximo passo seria
combinar este app com uma API que tenha atributos de audio ou com um backend que
salve votos dos usuarios.
