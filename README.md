# Poeta Carpinteiro AR

Experiência web de realidade aumentada baseada em rastreamento de imagem, criada para acompanhar o quadro em crochet do Poeta Carpinteiro. Aponta a câmara para o quadro físico e as cenas 3D surgem ancoradas ao próprio tecido.

## Como funciona

O projeto usa **MindAR** para detetar três zonas do quadro em tempo real. Quando uma zona é reconhecida, o conteúdo 3D fica spatialmente ancorado à imagem física — não é uma sobreposição fixa ao ecrã, mas sim fixada ao marcador no espaço tridimensional.

| Zona | Conteúdo |
|------|----------|
| Farol (canto direito) | Mar com ondas em shader GLSL + farol 3D |
| Flores (centro) | Campo de relva instanciada + flores animadas |
| Andorinhas (topo) | Bando de pássaros em voo com animação skeletal |

Cada cena tem áudio ambiente e narração associados, que arrancam automaticamente ao detetar o marcador e param ao perdê-lo.

## Stack

- **React 19** + **TypeScript**
- **Vite 6**
- **MindAR** (`mind-ar ^1.2.5`) — rastreamento de imagem
- **Three.js** (`^0.183.2`) — renderização 3D vanilla
- **Tailwind CSS**
- **React Router**

## Requisitos

- Node.js 18+
- npm
- Câmara (dispositivo móvel ou webcam) para a experiência AR
- Git LFS para os assets (modelos GLB, áudio MP3, imagens)

## Correr localmente

```bash
npm install
npm run dev
```

O servidor arranca na porta `3000`. Se estiver ocupada, o Vite escolhe automaticamente a seguinte disponível.

Para testar AR num dispositivo móvel, usa o IP local da máquina (ex: `http://192.168.x.x:3000`) — HTTPS não é obrigatório em rede local, mas é necessário em produção para aceder à câmara.

## Scripts

```bash
npm run dev      # desenvolvimento com hot reload
npm run build    # build de produção
npm run preview  # preview local da build
npm run lint     # verificação de tipos (tsc --noEmit)
```

## Rotas

| Rota | Descrição |
|------|-----------|
| `/` | Landing page com timeline |
| `/ar` | Experiência AR principal (MindAR + 3 cenas) |
| `/markers` | Página com os QR codes dos marcadores |

## Estrutura

```
src/
  pages/
    ARPage.tsx          # página AR unificada — MindAR + 3 cenas ancoradas
    LandingPage.tsx     # landing com timeline
    QRCodePage.tsx      # página de marcadores
  components/
    timeline/           # componentes da timeline na landing
    QRScanner.tsx       # leitor de QR code
  constants/
    assets.ts           # caminhos de modelos, áudio e imagens
  types/
    content.ts          # tipos do conteúdo textual

public/
  targets/
    target1.jpg         # zona do farol (âncora 0)
    target2.jpg         # zona das flores (âncora 1)
    target3.jpg         # zona dos pássaros (âncora 2)
    quadro.png          # quadro original completo
  models/               # modelos GLB (farol, flor, pássaro)
  sounds/               # áudio ambiente e narrações
  data/
    texts.json          # conteúdos textuais da app
```

## Targets AR

Os três ficheiros `target*.jpg` são recortes do quadro em crochet original (`quadro.png`), cada um correspondendo a uma zona distinta da composição. O MindAR compila-os em formato `.mind` na primeira visita e guarda em IndexedDB (chave `mind-targets-v2`) para carregamentos seguintes.

## Assets e Git LFS

Os modelos GLB, ficheiros de áudio e imagens grandes estão rastreados com Git LFS. Para clonar com todos os assets:

```bash
git lfs install
git clone <url-do-repo>
```

Se os ficheiros aparecerem como ponteiros em vez do conteúdo real, corre `git lfs pull`.
