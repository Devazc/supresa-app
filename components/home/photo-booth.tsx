import { FADE_DOWN_ANIMATION_VARIANTS } from "@/lib/constants";
import { AnimatePresence, motion, MotionConfig } from "framer-motion";
import { Download } from "lucide-react";
import { useRouter } from "next/router";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { LoadingCircle } from "../shared/icons";

const variants = {
  enter: (direction: number) => {
    return {
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    };
  },
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => {
    return {
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
    };
  },
};

function forceDownload(blobUrl: string, filename: string) {
  let a: any = document.createElement("a");
  a.download = filename;
  a.href = blobUrl;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export default function PhotoBooth({
  input,
  blurDataURL,
  output,
}: {
  input: string;
  blurDataURL: string;
  output?: string;
}) {
  const router = useRouter();
  const { id } = router.query;

  const [state, setState] = useState("output");
  const direction = useMemo(() => (state === "output" ? 1 : -1), [state]);
  const [downloading, setDownloading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showHelper, setShowHelper] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      if (loading) {
        setShowHelper(true);
      }
    }, 2000);
  }, [loading]);

  return (
    <motion.div
      className="group relative mx-auto mt-10 h-[600px] w-[600px] overflow-hidden rounded-2xl border border-gray-200"
      variants={FADE_DOWN_ANIMATION_VARIANTS}
    >
      <button
        onClick={() => setState(state === "output" ? "input" : "output")}
        className="absolute top-5 left-5 z-10 rounded-full border border-gray-200 bg-white px-4 py-2 shadow-sm transition-all hover:scale-105 active:scale-95"
      >
        <p className="text-sm font-semibold text-gray-500">
          {state === "output" ? "View original" : "View result"}
        </p>
      </button>
      {output && state === "output" && (
        <button
          onClick={() => {
            setDownloading(true);
            fetch(output, {
              headers: new Headers({
                Origin: location.origin,
              }),
              mode: "no-cors",
            })
              .then((response) => response.blob())
              .then((blob) => {
                let blobUrl = window.URL.createObjectURL(blob);
                forceDownload(
                  blobUrl,
                  `${id || "demo"}.${state === "output" ? "gif" : ""}`,
                );
                setDownloading(false);
              })
              .catch((e) => console.error(e));
          }}
          className="absolute top-5 right-5 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm transition-all hover:scale-105 active:scale-95"
        >
          {downloading ? (
            <LoadingCircle />
          ) : (
            <Download className="h-5 w-5 text-gray-500" />
          )}
        </button>
      )}
      <MotionConfig
        transition={{
          x: { type: "spring", stiffness: 300, damping: 30 },
          opacity: { duration: 0.2 },
        }}
      >
        <AnimatePresence initial={false} custom={direction}>
          {state === "output" ? (
            <motion.div
              key={output}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              className="absolute h-full w-full"
            >
              {loading && (
                <div className="z-10 flex h-full w-full flex-col items-center bg-white pt-[280px]">
                  <LoadingCircle />
                  {id && showHelper && (
                    <motion.form
                      className="my-4 flex flex-col items-center space-y-4"
                      initial="hidden"
                      whileInView="show"
                      animate="show"
                      viewport={{ once: true }}
                      variants={{
                        hidden: {},
                        show: {
                          transition: {
                            staggerChildren: 0.2,
                          },
                        },
                      }}
                      onSubmit={(e) => {
                        e.preventDefault();
                        const email = e.currentTarget.email.value;
                        alert(email);
                      }}
                    >
                      <motion.p
                        className="text-sm text-gray-500"
                        variants={FADE_DOWN_ANIMATION_VARIANTS}
                      >
                        This can take anywhere between 20 seconds to 2 minutes.
                      </motion.p>
                      <motion.input
                        className="w-full border-b border-gray-200 bg-white px-5 py-2 text-center text-sm transition-colors placeholder:text-gray-400 focus:border-gray-800 focus:outline-none focus:ring-0"
                        placeholder="Send me an email when it's done"
                        type="email"
                        id="email"
                        name="email"
                        variants={FADE_DOWN_ANIMATION_VARIANTS}
                      />
                    </motion.form>
                  )}
                </div>
              )}
              {output && (
                <Image
                  alt="demo gif"
                  src={output}
                  width={1280}
                  height={1280}
                  className="object-cover"
                  onLoadingComplete={() => setLoading(false)}
                />
              )}
            </motion.div>
          ) : (
            <motion.div
              key={input}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              className="absolute h-full w-full"
            >
              <Image
                alt="original image"
                src={input}
                className="object-cover"
                placeholder="blur"
                blurDataURL={blurDataURL}
                fill
              />
            </motion.div>
          )}
        </AnimatePresence>
      </MotionConfig>
    </motion.div>
  );
}