import type { StaticImageData } from "next/image";

import ghana from "../../assets/photos/tranca-ghana.jpg";
import ghana2 from "../../assets/photos/tranca-ghana-2.jpg";
import nago from "../../assets/photos/tranca-nago.jpg";
import fulani from "../../assets/photos/tranca-fulani.jpg";
import tiara from "../../assets/photos/tranca-tiara.jpg";
import lateral from "../../assets/photos/tranca-lateral.jpg";
import goddess from "../../assets/photos/tranca-goddess.jpg";
import box from "../../assets/photos/tranca-box.jpg";

// Fotos enviadas pela Maysa para cada trança (a segunda é opcional).
export const braidPhotos: Record<string, { main: StaticImageData; extra?: StaticImageData }> = {
  ghana: { main: ghana, extra: ghana2 },
  nago: { main: nago },
  fulani: { main: fulani },
  tiara: { main: tiara },
  lateral: { main: lateral },
  goddess: { main: goddess },
  box: { main: box },
};
