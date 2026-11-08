# Portfolio — Nguyễn Hữu Huy

Website portfolio cá nhân phong cách **pixel art lai Google web**: nền trắng, viền đen 2px,
đổ bóng cứng, font pixel tự host và các dải GIF ngang do chính script trong repo sinh ra.

- Next.js 16 (App Router) + React 19 + TypeScript
- Song ngữ **Tiếng Việt / English** (nút `VI | EN` ở header và footer, có lưu lựa chọn)
- Toàn bộ ảnh GIF pixel art được tạo bằng Python/Pillow, không cần tải asset từ ngoài
- Font tự host (VT323, Press Start 2P, Inter, Space Mono) — có đầy đủ dấu tiếng Việt

![Giao diện trang chủ](docs/preview-hero.png)

_Xem thêm: [mục nghiên cứu khoa học](docs/preview-research.png) · [toàn bộ trang](docs/preview-full.png)._

## Chạy dự án

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # build production
npm run start    # chạy bản build
```

## Cấu trúc

```
app/
  layout.tsx        metadata, viewport, nạp CSS
  page.tsx          render <Portfolio />
  globals.css       toàn bộ design system (token, layout, component, responsive)
  fonts.css         @font-face tự sinh, trỏ tới public/fonts
  icon.svg          favicon pixel "H"
components/
  portfolio.tsx     khung trang: provider ngôn ngữ, progress bar, nút lên đầu trang
  lang-context.tsx  state ngôn ngữ + localStorage + ?lang=vi|en
  header.tsx        thanh điều hướng sticky, scroll-spy, menu mobile
  hero.tsx          banner GIF, thẻ giới thiệu, ID card pixel
  about.tsx         giới thiệu + thông tin nhanh + ảnh CRT
  skills.tsx        nhóm kỹ năng, thanh tiến trình pixel theo cuộn
  projects.tsx      bộ lọc dự án + dialog chi tiết (native <dialog>)
  research.tsx      mục nghiên cứu khoa học: poster pixel (SVG) + trích dẫn BibTeX copy được
  journey.tsx       timeline các cột mốc
  contact.tsx       email (copy được), mạng xã hội
  footer.tsx        ticker GIF + cột liên kết
  reveal.tsx        hiệu ứng xuất hiện khi cuộn (IntersectionObserver)
  pixel-cover.tsx   ảnh bìa dự án vẽ bằng SVG pixel
lib/i18n.ts         TOÀN BỘ nội dung VI/EN (sửa nội dung ở đây)
public/gifs/        10 file GIF do scripts/make_gifs.py sinh ra
public/fonts/       woff2 tự host theo subset latin/latin-ext/vietnamese
scripts/
  make_gifs.py      sinh lại toàn bộ GIF pixel (Pillow)
  fetch-fonts.py    tải lại font từ Google Fonts (chỉ cần khi đổi font)
```

## Sửa nội dung

Mọi câu chữ nằm trong `lib/i18n.ts`, gồm hai object `vi` và `en` có cùng cấu trúc:
tiêu đề, giới thiệu, thông tin nhanh, kỹ năng, 5 dự án, công bố khoa học, hành trình,
liên hệ, footer. Sửa một bên thì TypeScript sẽ báo nếu bên còn lại thiếu khoá tương ứng.

Bài báo hiện có: **EPU-HEKV: Hierarchical External Memory for Bounded Active Reasoning**
(Asian Comnet 2026, Best Poster Award) — nằm trong `research.items`. Thêm bài mới bằng
cách thêm một phần tử vào mảng đó (mỗi bài tự render thành một card).

Thông tin cá nhân hiện tại là **nội dung mẫu do mình tự đặt** (tên, trường, GPA,
kinh nghiệm, dự án, email, link mạng xã hội). Thay bằng thông tin thật trong `lib/i18n.ts`.
Link mạng xã hội đang trỏ tới các handle giả lập — nhớ đổi trước khi deploy.

## Tạo lại ảnh GIF / font

```bash
npm run assets   # cần Python 3 + Pillow; ghi đè public/gifs/*.gif
npm run fonts    # cần Internet; tải woff2 và ghi lại app/fonts.css
```

`scripts/make_gifs.py` vẽ ở lưới pixel logic (mỗi pixel = 5px thiết bị) bằng một bộ font
bitmap 5×7 tự viết, palette cố định, palette ảnh được lượng tử hoá nên GIF rất nhẹ
(tổng khoảng 0.9 MB cho 10 ảnh). Muốn thêm ảnh mới: viết hàm `b_ten_anh(t, n)` rồi
đăng ký trong `BUILDERS`.

## Ghi chú kỹ thuật

- **Ngôn ngữ**: mặc định `vi`; lựa chọn lưu ở `localStorage` (`hh-lang`); link
  `?lang=en` hoặc `?lang=vi` sẽ ưu tiên hơn, tiện chia sẻ.
- **Pixel sắc nét**: ảnh GIF dùng `image-rendering: pixelated`, kích thước đều là bội số của 5.
- **Truy cập**: skip link, `aria-pressed` cho nút ngôn ngữ/bộ lọc, dialog dùng `<dialog>`
  của trình duyệt (tự khoá focus và đóng bằng `Esc`), có `prefers-reduced-motion`.
- **Ảnh**: các GIF bên dưới màn hình đầu dùng `loading="lazy"`.
- **Dev**: chạy `npm run dev -- --port 3105` nếu cổng 3000 bận.

## Ghi công

Font: VT323, Press Start 2P, Inter, Space Mono (Google Fonts, OFL/Apache-2.0).
GIF, ảnh bìa SVG và toàn bộ giao diện được tạo trong repo này.
