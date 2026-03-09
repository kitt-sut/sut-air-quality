# SUT Air Quality Monitoring

แอปพลิเคชันเว็บสำหรับติดตามและรายงานคุณภาพอากาศ (ค่าฝุ่น PM 2.5) ภายในมหาวิทยาลัยเทคโนโลยีสุรนารี (SUT) แบบ Real-time ตัวแอปพลิเคชันถูกออกแบบมาให้ใช้งานง่าย แสดงผลข้อมูลรวดเร็ว และบอกระดับคุณภาพอากาศตามมาตรฐานของประเทศไทย (กรมควบคุมมลพิษ)

🔗 **หน้าเว็บหลัก (Dashboard):** [SUT Air Pollution Dashboard](https://sut-air-pollution.vercel.app/)

## ฟีเจอร์หลัก (Features)

- **Real-time Monitoring:** ดึงข้อมูลค่าฝุ่น PM 2.5 ล่าสุดมาแสดงผลอัตโนมัติทุกๆ 1 นาที
- **AQI Standard:** แปลงค่า PM 2.5 เป็นระดับคุณภาพอากาศ (AQI) พร้อมคำแนะนำในการปฏิบัติตัว ตามเกณฑ์ของกรมควบคุมมลพิษของประเทศไทย
- **Google Sheets Integration:** ดึงข้อมูลจากเซนเซอร์ IoT ที่บันทึกไว้ใน Google Sheets มาแสดงผล
- **Responsive Design:** แสดงผลได้สวยงามและรองรับการใช้งานบนทุกขนาดหน้าจอ (มือถือ, แท็บเล็ต, เดสก์ท็อป)
- **Smooth Animations:** มีแอนิเมชันตัวเลขวิ่ง (CountUp) และการโหลดข้อมูลที่ดูลื่นไหลสบายตา

## เทคโนโลยีและเครื่องมือที่ใช้ (Tech Stack & Libraries)

โปรเจ็กต์นี้ถูกพัฒนาขึ้นด้วยเครื่องมือและไลบรารีสมัยใหม่ ดังนี้:

- **[React 18](https://react.dev/):** ไลบรารีหลักสำหรับสร้าง User Interface (UI)
- **[Vite](https://vitejs.dev/):** เครื่องมือ Build tool ที่ช่วยให้การรันเซิร์ฟเวอร์พัฒนา (Dev Server)
- **[Tailwind CSS](https://tailwindcss.com/):** Utility-first CSS framework สำหรับตกแต่งหน้าเว็บให้สวยงามและทำงานแบบ Responsive
- **[PapaParse](https://www.papaparse.com/):** ไลบรารีสำหรับดึงและแปลงข้อมูล (Parse) จากไฟล์ CSV (Google Sheets) ให้กลายเป็นออบเจกต์ JSON ที่ใช้งานง่ายใน JavaScript
- **[ESLint](https://eslint.org/):** เครื่องมือตรวจสอบความถูกต้องและรักษามาตรฐานการเขียนโค้ด

## การติดตั้งและใช้งาน (Installation & Setup)

ทำตามขั้นตอนด้านล่างนี้เพื่อรันโปรเจ็กต์ในเครื่องคอมพิวเตอร์ของคุณ:

### 1. โคลนโปรเจ็กต์ (Clone the repository)
```bash
git clone https://github.com/kitt-sut/sut-air-quality
cd sut-air-quality
```

### 2. ติดตั้ง Dependencies
```bash
npm install
```

### 3. ตั้งค่า Environment Variables
สร้างไฟล์ .env ไว้ที่โฟลเดอร์นอกสุดของโปรเจ็กต์ (Root directory) และกำหนดค่า Google Sheet ID ที่เก็บข้อมูลเซนเซอร์
```bash
VITE_GOOGLE_SHEET_ID=รหัส_Google_Sheet_ของคุณ
```
(หมายเหตุ: ไฟล์ Google Sheet ของคุณจะต้องตั้งค่าการแชร์ให้ทุกคนที่มีลิงก์สามารถเข้าถึงเพื่ออ่านข้อมูลได้)

### 4. รันเซิร์ฟเวอร์สำหรับพัฒนา (Run Development Server)
```bash
npm run dev
```

## โครงสร้างของโปรเจ็กต์ (Project Structure)
```text
sut-air-quality/
├── public/               # เก็บไฟล์รูปภาพและไอคอนต่างๆ (เช่น รูปอาคาร, รูปไอคอนเว็บ)
├── src/
│   ├── components/       # UI Components ส่วนต่างๆ ของแอป (LocationCard, AQILegend, Icons)
│   ├── config/           # ไฟล์ตั้งค่าระบบ (ข้อมูลสถานที่, ตั้งค่าความถี่ในการดึงข้อมูล)
│   ├── hooks/            # Custom React Hooks สำหรับจัดการลอจิก (useCountUp, useSensorData)
│   ├── services/         # ฟังก์ชันจัดการ API/Data (เช่น ดึงข้อมูลจาก Google Sheets)
│   ├── utils/            # ฟังก์ชันช่วยเหลือ (การแปลงค่า PM 2.5 เป็น AQI)
│   ├── App.jsx           # คอมโพเนนต์หลักที่ประกอบส่วนต่างๆ เข้าด้วยกัน
│   ├── main.jsx          # จุดเริ่มต้นการทำงานของแอป React
│   └── index.css         # ไฟล์ CSS หลัก (ประกอบด้วย Tailwind directives และ Custom CSS)
├── .env                  # ไฟล์เก็บตัวแปรระบบ (ต้องสร้างเองตอนติดตั้ง)
├── package.json          # ไฟล์รวบรวมข้อมูลโปรเจ็กต์, Scripts และ Libraries ที่ต้องใช้
└── tailwind.config.js    # ไฟล์ตั้งค่า Tailwind CSS
```

## แหล่งที่มาของข้อมูล (Data Source)
โปรเจ็กต์นี้อ่านข้อมูลค่า PM 2.5 จาก Google Sheets แบบสาธารณะ โดยจะอ่านข้อมูล 10 แถวล่าสุดผ่าน URL export?format=csv แล้วค้นหาค่า PM 2.5 ล่าสุด (คอลัมน์ที่ 5 หรือคอลัมน์ E) มาแสดงผล หากพบข้อผิดพลาดในการดึงข้อมูล ระบบจะแสดงแบนเนอร์แจ้งเตือนและพยายามโหลดข้อมูลใหม่โดยอัตโนมัติ

## เกณฑ์คุณภาพอากาศ (AQI Standard)
อ้างอิงเกณฑ์ใหม่ของ กรมควบคุมมลพิษ กระทรวงทรัพยากรธรรมชาติและสิ่งแวดล้อม (มิ.ย. 2566):

- 0.0 – 15.0 µg/m³: ดีมาก (Very Good)

- 15.1 – 25.0 µg/m³: ดี (Good)

- 25.1 – 37.5 µg/m³: ปานกลาง (Moderate)

- 37.6 – 75.0 µg/m³: เริ่มมีผลกระทบต่อสุขภาพ (Unhealthy for Sensitive Groups)

- > 75.0 µg/m³: มีผลกระทบต่อสุขภาพ (Unhealthy)