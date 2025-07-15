---
url: "https://docs.solanapay.com/api/core/function/createQR"
title: "createQR | API | Solana Pay Docs"
---

[Skip to main content](https://docs.solanapay.com/api/core/function/createQR#)

### Callable

- createQR(url: string \| URL, size?: number, background?: string, color?: string): QRCodeStyling

* * *

- Create a QR code from a Solana Pay URL.








* * *



#### Parameters



  - ##### url: string \| URL








    The URL to encode.

  - ##### size: number = 512








    Width and height in pixels.

  - ##### background: string = 'white'








    Background color, which should be light for device compatibility.

  - ##### color: string = 'black'








    Foreground color, which should be dark for device compatibility.


#### Returns QRCodeStyling