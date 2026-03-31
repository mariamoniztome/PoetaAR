export interface TimelineEventItem {
  year: string;
  title: string;
  desc: string;
  imageA?: string;
  imageB?: string;
}

export interface PoemData {
  id: string;
  title: string;
  verses: string[];
  marker: {
    roman: string;
    label: string;
    qrCode: string;
  };
}

export interface AppTexts {
  timelinePage: {
    header: {
      titleHtml: string;
    };
    events: TimelineEventItem[];
    ctaLabel: string;
    ctaButton: string;
  };
  poems: PoemData[];
  screens: {
    ar: {
      statusInitial: string;
      hudIndicatorWaiting: string;
      loadingText: string;
      hudTitle: string;
      backButton: string;
    };
  };
  ui: {
    ar: {
      statusPointToQr: string;
      statusQrDetected: string;
      statusWorldBloom: string;
      indicatorPrefix: string;
      indicatorNoCamera: string;
    };
    cameraErrors: {
      fallback: string;
    };
  };
  markersPage: {
    title: string;
    subtitle: string;
    instructionLine1: string;
    instructionLine2: string;
    instructionLine3: string;
    printButton: string;
    footer: string;
    markerPrefix: string;
  };
}
