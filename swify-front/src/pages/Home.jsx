import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { GoArrowRight } from "react-icons/go";
import gsap from "gsap";



export default function SwifySplash() {
  const btnRef = useRef(null);
const splashRef = useRef(null);
const navigate = useNavigate();
 
const handleContinue = (e) => {
  const rect = btnRef.current.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
 
  gsap.set(splashRef.current, { x, y, width: 0, height: 0, opacity: 0.5 });
 
  const tl = gsap.timeline({
    onComplete: () => navigate("/login"),
  });
 
  tl.to(splashRef.current, {
    width: 500,
    height: 500,
    x: x - 250,
    y: y - 250,
    opacity: 0.9,
    duration: 0.55,
    ease: "power2.out",
  })
    .to(
      btnRef.current.querySelectorAll("span, svg"),
      { opacity: 0, duration: 0.2 },
      "<"
    )
    .to(btnRef.current, { scale: 0.97, duration: 0.15 }, "<");
};
  return (
    <div>
      <div className="min-h-screen w-full flex flex-col items-center justify-between bg-[#FFFFF] text-white pt-8">

      <div className="flex flex-col mt-10 items-center">
        <div className="w-25 h-25 rounded-[28px] bg-[#000] flex items-center justify-center shadow-lg">
          <span className="text-white text-7xl font-bold tracking-tight">S</span>
        </div>
        <h1 className="mt-4 text-3xl font-[#pogonia] text-black">SWIFY</h1>
        <p className="mt-2 text-sm tracking-[0.2em] font-[#urbanist] text-gray-700 uppercase">
          move . money . fast
        </p>
      </div>
      
      <div className="px-5 mt-10 flex mb-8 flex-col gap-4">
        <h2 className="text-2xl font-bold text-black whitespace-nowrap">Get Started With SWIFY</h2>
        <button
  ref={btnRef}
  onClick={handleContinue}
  className="relative overflow-hidden w-full h-full bg-black text-2xl flex justify-center rounded-md items-center gap-20 text-white py-3"
>
  <span
    ref={splashRef}
    className="absolute rounded-full bg-white pointer-events-none"
    style={{ top: 0, left: 0 }}
  />
  <span className="relative z-10">Continue</span>
  <GoArrowRight className="relative z-10" />
</button>
      </div>
    </div>
    </div>
  );
}