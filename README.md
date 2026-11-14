# Tendencias Tecnológicas

Reemplazá los datos de ejemplo por datos reales. Leé este CSV con fetch al cargar la página: https://docs.google.com/spreadsheets/d/e/2PACX-1vQY2Tkhj04D3ATjxYksPKkHYk39MEkt_iK71z2_vgQ5E2HBitaiGBQLs0kTvKXdPEb_JnF4wxdGcvbX/pub?gid=0&single=true&output=csv. Usá papaparse con header:true y convertí madurez_TRL, adopcion_hoy, potencial y brecha a número. Las columnas son: fecha_ejecucion, tendencia, categoria, descripcion, horizonte, madurez_TRL, adopcion_hoy, potencial, brecha, regiones, barreras, fuente_url, cita_APA, fecha_fuente, confianza. Mostrá un estado de carga y un mensaje si falla. Agregá un botón "Actualizar datos" que vuelva a leer el CSV.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/73e392ba-bcb0-4d0b-ae48-ff867e06197f).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
