#include <core/SkSurface.h>
#include <core/SkCanvas.h>
#include <encode/SkPngEncoder.h>
#include <core/SkStream.h>

int main() {
    SkImageInfo info = SkImageInfo::MakeN32Premul(1920, 1080);
    sk_sp<SkSurface> surface = SkSurfaces::Raster(info);
    if (!surface) return 1;

    SkCanvas *canvas = surface -> getCanvas();
    canvas -> clear(SK_ColorWHITE);

    SkPaint paint;
    paint.setColor(SK_ColorBLACK);
    paint.setStrokeWidth(10);   
    paint.setStroke(false);

    canvas -> drawRect(SkRect::MakeXYWH(100, 100, 1280, 720), paint);

    sk_sp<SkImage> image (surface -> makeImageSnapshot());
    if (!image) return 1;

    SkPixmap pixmap;
    if (!image -> peekPixels(&pixmap)) return 1;

    SkFILEWStream fileStream ("output.png");
    if (!fileStream.isValid()) return 1;

    SkPngEncoder::Options options;
    options.fZLibLevel = 9;

    if (!SkPngEncoder::Encode(&fileStream, pixmap, options)) return 1;

    return 0;
}   
