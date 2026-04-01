<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Poeta Carpinteiro AR

Experiencia web imersiva com 3 cenas 3D/AR inspiradas no universo do Poeta Carpinteiro:

- Mar (`/scene/sea`)
- Campo (`/scene/field`)
- Ceu (`/scene/sky`)

O projeto usa React + Vite + Three.js (React Three Fiber), com configuracao em tempo real por paineis de debug por cena.

## Stack

- React 19
- Vite 6
- TypeScript
- Three.js + @react-three/fiber + @react-three/drei
- Zustand (estado por cena)
- Tailwind CSS
- React Router

## Requisitos

- Node.js 18+
- npm
- Git LFS (recomendado para assets grandes)

## Run Locally

1. Instalar dependencias:

```bash
npm install
```

2. Correr em desenvolvimento:

```bash
npm run dev
```

Por defeito tenta usar a porta `3000`.
Se estiver ocupada, o Vite muda automaticamente para a seguinte disponivel (`3001`, `3002`, ...).

## Scripts

```bash
npm run dev      # desenvolvimento
npm run build    # build producao
npm run preview  # preview local da build
npm run lint     # type-check (tsc --noEmit)
```

## Rotas principais

- `/` landing
- `/markers` pagina de marcadores QR
- `/scene/sea` cena 1
- `/scene/field` cena 2
- `/scene/sky` cena 3

## Estrutura

- `src/scene1` mar + farol
- `src/scene2` campo + flores/relva
- `src/scene3` ceu + bando + nuvens
- `src/components/debug` painel debug reutilizavel
- `public/data/texts.json` conteudos textuais

## Debug em tempo real

Cada cena tem um painel lateral de debug com:

- parametros de modelo (escala, contagem, posicao)
- luz e cores
- comportamento da animacao/movimento
- botao de export JSON

## Assets grandes e Git LFS

Este repositorio usa media pesados (modelos, audio, imagens). Para evitar erros de push por limite de 100MB do GitHub, usa Git LFS.

### Setup rapido LFS

```bash
git lfs install
git lfs track "src/assets/models/*.glb"
git lfs track "src/assets/sound/*.mp3"
git lfs track "src/assets/img/*.png"
git lfs track "src/assets/img/*.jpg"
git lfs track "src/assets/img/*.jpeg"
git add .gitattributes
git commit -m "chore: track assets with Git LFS"
```

## Notas

- Alguns parametros de cena podem ser pesados (contagens muito altas de instancias).
- Se houver degradacao de performance, reduz `grassCount`, `flowerCount` e sombras dinâmicas.

