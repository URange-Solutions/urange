import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "URange Solutions";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

// Place these two font files in the same folder as this file:
// app/opengraph-image/ArchivoBlack-Regular.ttf
// app/opengraph-image/Inter-Regular.ttf
const archivoBlack = fetch(
  new URL("./ArchivoBlack-Regular.ttf", import.meta.url)
).then((res) => res.arrayBuffer());

const interRegular = fetch(
  new URL("./Inter-Regular.ttf", import.meta.url)
).then((res) => res.arrayBuffer());

export default async function OpenGraphImage() {
  const [fontData, interData] = await Promise.all([
    archivoBlack,
    interRegular,
  ]);

  // Replace with your actual logo URL or local asset
  const logo = new URL(
    "/logo.png",
    process.env.NEXT_PUBLIC_APP_URL ?? "https://urange.tech"
  ).toString();

  return new ImageResponse(
    (
      <div
        style={{
          position: "relative",
          display: "flex",
          width: "100%",
          height: "100%",
          overflow: "hidden",
          background: "#09090b",
          color: "white",
        }}
      >
        {/* Background Grid */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0.18,
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.05) 1px, transparent 1px),linear-gradient(90deg, rgba(255,255,255,.05) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
          }}
        />

        {/* Top Right Glow */}
        <div
          style={{
            position: "absolute",
            right: -120,
            top: -120,
            width: 520,
            height: 520,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(255,38,0,.22) 0%, rgba(255,38,0,.08) 45%, transparent 75%)",
          }}
        />

        {/* Bottom Left Glow */}
        <div
          style={{
            position: "absolute",
            left: -150,
            bottom: -160,
            width: 500,
            height: 500,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(255,38,0,.14) 0%, transparent 70%)",
          }}
        />

        {/* Large Rings */}
        <div
          style={{
            position: "absolute",
            right: -160,
            top: -170,
            width: 420,
            height: 420,
            borderRadius: "50%",
            border: "42px solid rgba(255,38,0,.10)",
          }}
        />

        <div
          style={{
            position: "absolute",
            right: -40,
            top: -30,
            width: 190,
            height: 190,
            borderRadius: "50%",
            border: "8px solid rgba(255,38,0,.18)",
          }}
        />

        {/* Dot Pattern */}
        <div
          style={{
            position: "absolute",
            left: 40,
            top: 45,
            width: 180,
            height: 150,
            opacity: 0.18,
            backgroundImage:
              "radial-gradient(rgba(255,255,255,.8) 1.2px, transparent 1.2px)",
            backgroundSize: "12px 12px",
          }}
        />

        {/* Bottom Right Dot Pattern */}
        <div
          style={{
            position: "absolute",
            right: 40,
            bottom: 40,
            width: 180,
            height: 150,
            opacity: 0.12,
            backgroundImage:
              "radial-gradient(rgba(255,255,255,.8) 1.2px, transparent 1.2px)",
            backgroundSize: "12px 12px",
          }}
        />

        {/* Side Accent */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 220,
            width: 6,
            height: 130,
            background: "#ff2600",
          }}
        />

        <div
          style={{
            position: "absolute",
            right: 0,
            bottom: 170,
            width: 6,
            height: 130,
            background: "#ff2600",
          }}
        />

        {/* Dashed Arc */}
        <svg
          width="140"
          height="260"
          style={{
            position: "absolute",
            right: 0,
            top: 170,
            opacity: 0.35,
          }}
        >
          <path
            d="M140 10 A120 120 0 0 1 140 250"
            fill="none"
            stroke="#ff2600"
            strokeWidth="2"
            strokeDasharray="8 8"
          />
        </svg>

        {/* Diamond */}
        <svg
          width="22"
          height="22"
          style={{
            position: "absolute",
            left: "50%",
            top: 30,
            transform: "translateX(-50%)",
          }}
        >
          <polygon
            points="11,1 21,11 11,21 1,11"
            fill="none"
            stroke="#ff2600"
            strokeWidth="1.5"
          />
          <polygon
            points="11,6 16,11 11,16 6,11"
            fill="#ff2600"
            opacity="0.45"
          />
        </svg>

        {/* Content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "100%",
            padding: "58px 70px",
            zIndex: 10,
          }}
        >
          {/* Logo */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
            }}
          >
            <img src={logo} width={70} height={70} alt="URange" />

            <div
              style={{
                marginLeft: 12,
                display: "flex",
                flexDirection: "column",
              }}
            >
              <span
                style={{
                  fontSize: 34,
                  color: "#ffffff",
                  fontFamily: "Archivo Black",
                }}
              >
                URange Solutions
              </span>

              <span
                style={{
                  fontFamily: "Inter",
                  fontSize: 18,
                  color: "#9ca3af",
                }}
              >
                Software Development Company
              </span>
            </div>
          </div>

          {/* Headline */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              maxWidth: 760,
            }}
          >
            <span
              style={{
                fontSize: 74,
                letterSpacing: -3,
                fontFamily: "Archivo Black",
              }}
            >
              TURNING
            </span>

            <span
              style={{
                fontSize: 74,
                letterSpacing: -3,
                color: "#ff2600",
                fontFamily: "Archivo Black",
              }}
            >
              VISIBLE PROBLEMS
            </span>

            <span
              style={{
                fontSize: 74,
                letterSpacing: -3,
                fontFamily: "Archivo Black",
              }}
            >
              INTO SYSTEMS
            </span>

            <span
              style={{
                marginTop: 24,
                fontFamily: "Inter",
                fontSize: 26,
                lineHeight: 1.5,
                color: "#cbd5e1",
              }}
            >
              Practical digital solutions that simplify real-world processes
              through modern software.
            </span>
          </div>

          {/* Tags */}
          <div
            style={{
              display: "flex",
              gap: 14,
            }}
          >
            {[
              "WEB DEVELOPMENT",
              "CUSTOM SYSTEMS",
              "MOBILE APPS",
              "IoT",
            ].map((item) => (
              <div
                key={item}
                style={{
                  display: "flex",
                  padding: "10px 18px",
                  borderRadius: 999,
                  border: "1px solid rgba(255,255,255,.08)",
                  background: "rgba(255,255,255,.05)",
                  fontFamily: "Inter",
                  fontSize: 18,
                  color: "#d4d4d8",
                }}
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    {
      width: size.width,
      height: size.height,
      fonts: [
        {
          name: "Archivo Black",
          data: fontData,
          weight: 400,
          style: "normal",
        },
        {
          name: "Inter",
          data: interData,
          weight: 400,
          style: "normal",
        },
      ],
    }
  );
}