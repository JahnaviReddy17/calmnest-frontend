import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, RotateCcw, Wind, HeartPulse, Music, Video, Disc, CheckCircle, Volume2 } from "lucide-react";
import api from "../services/api";

export default function WellnessActivities() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("breathing");
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: "easeOut" } }
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="max-w-6xl mx-auto pb-12">
      <motion.div variants={itemVariants} className="mb-8">
        <h1 className="text-4xl font-extrabold text-text-900 mb-2 tracking-tight">
          Wellness Activities 🌿
        </h1>
        <p className="text-lg text-text-500">
          Personalized mindfulness and relaxation exercises based on your mood.
        </p>
      </motion.div>

      {/* Tabs */}
      <motion.div variants={itemVariants} className="flex flex-wrap gap-4 mb-8">
        {[
          { id: "breathing", label: "Breathing", icon: <Wind size={18} /> },
          { id: "meditation", label: "Meditation", icon: <HeartPulse size={18} /> },
          { id: "therapy", label: "Sensory Therapy", icon: <Music size={18} /> },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-medium transition-all duration-300 ${
              activeTab === tab.id 
              ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30 -translate-y-1' 
              : 'bg-white/60 text-text-600 hover:bg-white hover:shadow-sm border border-white/50'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </motion.div>

      {/* Content Area */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === "breathing" && <BreathingExercise />}
          {activeTab === "meditation" && <MeditationTimer />}
          {activeTab === "therapy" && <SensoryTherapy />}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}

// Subcomponents

function BreathingExercise() {
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState("Inhale"); // Inhale, Hold, Exhale, Hold
  const [timeLeft, setTimeLeft] = useState(4);
  const cycleRef = useRef(null);
  const audioRef = useRef(new Audio("https://assets.mixkit.co/active_storage/sfx/2432/2432-preview.mp3"));

  useEffect(() => {
    if (!isActive) {
      clearInterval(cycleRef.current);
      audioRef.current.pause();
      return;
    }

    audioRef.current.play().catch(e => console.log("Audio play blocked"));
    audioRef.current.loop = true;

    cycleRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev > 1) return prev - 1;
        
        setPhase((currentPhase) => {
          if (currentPhase === "Inhale") return "Hold (Full)";
          if (currentPhase === "Hold (Full)") return "Exhale";
          if (currentPhase === "Exhale") return "Hold (Empty)";
          return "Inhale";
        });
        return 4; // 4 seconds per phase
      });
    }, 1000);

    return () => {
      clearInterval(cycleRef.current);
      audioRef.current.pause();
    };
  }, [isActive]);

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => {
    setIsActive(false);
    setPhase("Inhale");
    setTimeLeft(4);
  };

  const getScale = () => {
    if (!isActive) return 1;
    if (phase === "Inhale") return 1.5;
    if (phase === "Hold (Full)") return 1.5;
    if (phase === "Exhale") return 1;
    if (phase === "Hold (Empty)") return 1;
    return 1;
  };

  const handleComplete = async () => {
    try {
      await api.post("/wellness/activity", { activityType: "breathing", duration: 5 });
      alert("Activity logged successfully! Streak updated.");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-white/70 backdrop-blur-2xl rounded-3xl p-8 border border-white/40 shadow-sm flex flex-col items-center justify-center min-h-[500px] relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary-200/40 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary-200/40 rounded-full blur-3xl transform -translate-x-1/3 translate-y-1/3"></div>
      
      <div className="flex items-center gap-2 mb-2 relative z-10">
        <Volume2 size={20} className={isActive ? "text-primary-500 animate-pulse" : "text-text-400"} />
        <h2 className="text-2xl font-bold text-text-800">4-4-4-4 Box Breathing</h2>
      </div>
      <p className="text-text-500 mb-12 relative z-10">Follow the circle to regulate your nervous system.</p>


      <div className="relative w-64 h-64 flex items-center justify-center mb-12 z-10">
        {/* Animated breathing circle */}
        <motion.div
          animate={{ scale: getScale() }}
          transition={{ duration: 4, ease: "easeInOut" }}
          className="absolute w-40 h-40 bg-gradient-to-tr from-primary-400 to-secondary-300 rounded-full opacity-30 blur-md"
        ></motion.div>
        
        <motion.div
          animate={{ scale: getScale() }}
          transition={{ duration: 4, ease: "easeInOut" }}
          className="absolute w-32 h-32 bg-white rounded-full shadow-lg flex items-center justify-center border border-white/60 z-20"
        >
          <div className="text-center">
            <span className="block text-2xl font-bold text-primary-600">{timeLeft}</span>
            <span className="block text-xs font-semibold text-text-400 tracking-wider uppercase">{phase}</span>
          </div>
        </motion.div>
      </div>

      <div className="flex gap-4 relative z-10">
        <button 
          onClick={toggleTimer}
          className={`flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-white shadow-lg transition-transform hover:scale-105 active:scale-95 ${isActive ? 'bg-secondary-500 shadow-secondary-500/30' : 'bg-primary-500 shadow-primary-500/30'}`}
        >
          {isActive ? <><Pause size={20} /> Pause</> : <><Play size={20} /> Start</>}
        </button>
        <button 
          onClick={resetTimer}
          className="flex items-center gap-2 px-6 py-4 rounded-2xl font-bold text-text-600 bg-white border border-gray-200 shadow-sm hover:bg-gray-50 transition-colors"
        >
          <RotateCcw size={20} />
        </button>
        <button 
          onClick={handleComplete}
          className="flex items-center gap-2 px-6 py-4 rounded-2xl font-bold text-success-600 bg-success-50 border border-success-100 shadow-sm hover:bg-success-100 transition-colors tooltip"
          title="Log session to earn streaks"
        >
          <CheckCircle size={20} /> Complete
        </button>
      </div>
    </div>
  );
}

function MeditationTimer() {
  const [duration, setDuration] = useState(5 * 60);
  const [timeLeft, setTimeLeft] = useState(5 * 60);
  const [isActive, setIsActive] = useState(false);
  const timerRef = useRef(null);
  const audioRef = useRef(new Audio("https://assets.mixkit.co/active_storage/sfx/123/123-preview.mp3"));

  useEffect(() => {
    if (!isActive || timeLeft <= 0) {
      clearInterval(timerRef.current);
      audioRef.current.pause();
      if (timeLeft === 0 && isActive) {
        setIsActive(false);
        handleComplete();
      }
      return;
    }

    audioRef.current.play().catch(e => console.log("Audio play blocked"));
    audioRef.current.loop = true;

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => {
      clearInterval(timerRef.current);
      audioRef.current.pause();
    };
  }, [isActive, timeLeft]);

  const toggleTimer = () => setIsActive(!isActive);
  const setPreset = (mins) => {
    setIsActive(false);
    setDuration(mins * 60);
    setTimeLeft(mins * 60);
  };


  const handleComplete = async () => {
    try {
      await api.post("/wellness/activity", { activityType: "meditation", duration: duration / 60 });
      alert("Meditation logged successfully! You earned progress towards badges.");
    } catch (err) {
      console.error(err);
    }
  };

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;

  return (
    <div className="bg-gradient-to-br from-indigo-900 via-purple-900 to-black rounded-3xl p-8 shadow-2xl flex flex-col items-center justify-center min-h-[500px] relative overflow-hidden text-white">
      {/* Dynamic stars/particles background */}
      <div className="absolute inset-0 opacity-30">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            animate={{ 
              y: [0, -20, 0],
              opacity: [0.2, 0.8, 0.2],
            }}
            transition={{ 
              duration: 3 + Math.random() * 4, 
              repeat: Infinity, 
              delay: Math.random() * 2 
            }}
            className="absolute bg-white rounded-full"
            style={{
              width: Math.random() * 4 + 1 + 'px',
              height: Math.random() * 4 + 1 + 'px',
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
            }}
          />
        ))}
      </div>

      <h2 className="text-3xl font-light mb-8 relative z-10 tracking-widest">Mindful Minutes</h2>

      <div className="relative z-10 text-8xl font-extralight tracking-tight mb-12 drop-shadow-lg">
        {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
      </div>

      <div className="flex gap-4 mb-10 relative z-10">
        {[5, 10, 15, 20].map(m => (
          <button 
            key={m}
            onClick={() => setPreset(m)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${duration === m * 60 ? 'bg-white/30 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'}`}
          >
            {m} m
          </button>
        ))}
      </div>

      <button 
        onClick={toggleTimer}
        className="relative z-10 w-20 h-20 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all hover:scale-105"
      >
        {isActive ? <Pause size={32} /> : <Play size={32} className="ml-1" />}
      </button>
    </div>
  );
}

function SensoryTherapy() {
  const [recentMood, setRecentMood] = useState(3);
  const [activeSensory, setActiveSensory] = useState("sounds"); // sounds, colors
  const [selectedColor, setSelectedColor] = useState(null);
  
  useEffect(() => {
    api.get("/analytics/me").then(res => {
      if (res.data && res.data.moods && res.data.moods.length > 0) {
        setRecentMood(res.data.moods[res.data.moods.length - 1].mood);
      }
    }).catch(console.error);
  }, []);

  const getRecommendations = () => {
    if (recentMood <= 2) {
      return {
        title: "Calming Rescue",
        desc: "You seem stressed or overwhelmed. Use these sensory inputs to ground yourself.",
        sounds: [
          { name: "Ocean Waves", url: "https://www.soundjay.com/nature/ocean-wave-1.mp3" },
          { name: "Soft Rain", url: "https://www.soundjay.com/nature/rain-01.mp3" },
          { name: "Wind Chimes", url: "https://www.soundjay.com/clocks/wind-chime-1.mp3" }
        ],
        colors: ["#E0F2FE", "#DBEAFE", "#EDE9FE", "#F3E8FF", "#F0F9FF", "#E0E7FF"]
      };
    } else {
      return {
        title: "Vibrant Flow",
        desc: "Maintain your energy with these stimulating sensory experiences.",
        sounds: [
          { name: "Gentle Piano", url: "https://www.soundjay.com/misc/sounds/piano-melody-01.mp3" },
          { name: "Morning Birds", url: "https://www.soundjay.com/nature/sounds/bird-chirp-1.mp3" },
        ],
        colors: ["#FEF3C7", "#FFEDD5", "#ECFDF5", "#F0FDFA", "#FFF7ED", "#F5F3FF"]
      };
    }
  };

  const data = getRecommendations();

  return (
    <div className="bg-white/70 backdrop-blur-2xl rounded-3xl p-8 border border-white/40 shadow-sm min-h-[550px] relative overflow-hidden">
      {/* Background color preview for Color Therapy */}
      {selectedColor && activeSensory === "colors" && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.15 }}
          className="absolute inset-0 pointer-events-none z-0"
          style={{ backgroundColor: selectedColor }}
        />
      )}

      <div className="relative z-10">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h2 className="text-3xl font-bold text-text-800 mb-2">{data.title} 🎨</h2>
            <p className="text-text-500">{data.desc}</p>
          </div>
          <div className="flex bg-gray-100/50 backdrop-blur-sm p-1 rounded-xl border border-gray-200">
            <button 
              onClick={() => setActiveSensory("sounds")}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeSensory === "sounds" ? 'bg-white shadow-sm text-primary-600' : 'text-text-400 hover:text-text-600'}`}
            >
              Sounds
            </button>
            <button 
              onClick={() => setActiveSensory("colors")}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeSensory === "colors" ? 'bg-white shadow-sm text-secondary-600' : 'text-text-400 hover:text-text-600'}`}
            >
              Colors
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {activeSensory === "sounds" ? (
            <motion.div 
              key="sounds"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {data.sounds.map((sound, i) => (
                <SoundCard key={sound.name} sound={sound} />
              ))}
            </motion.div>
          ) : (
            <motion.div 
              key="colors"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col items-center"
            >
              <div className="mb-8 w-full h-40 rounded-3xl border-2 border-dashed border-gray-200 flex items-center justify-center relative overflow-hidden bg-gray-50/50">
                {selectedColor ? (
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute inset-0 flex items-center justify-center text-text-800 font-bold text-lg"
                    style={{ backgroundColor: selectedColor }}
                  >
                    Active Palette: {selectedColor}
                  </motion.div>
                ) : (
                  <span className="text-text-400 italic">Select a color to visualize its effect</span>
                )}
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-6 gap-4 w-full">
                {data.colors.map((color, i) => (
                  <motion.button
                    key={color}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      setSelectedColor(color);
                      // Fallback: also try changing body if visible
                      document.body.style.backgroundColor = color;
                    }}
                    className={`h-16 rounded-2xl cursor-pointer shadow-sm border-2 transition-all ${selectedColor === color ? 'border-primary-500 scale-110 shadow-md' : 'border-white'}`}
                    style={{ backgroundColor: color }}
                  ></motion.button>
                ))}
              </div>
              <button 
                onClick={() => {
                  setSelectedColor(null);
                  document.body.style.backgroundColor = "";
                }} 
                className="mt-12 px-6 py-2 bg-gray-100 text-text-600 rounded-full text-sm font-semibold hover:bg-gray-200 transition-colors"
              >
                Reset Canvas
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function SoundCard({ sound }) {
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const audioRef = useRef(null);

  const toggle = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio(sound.url);
      audioRef.current.onended = () => setPlaying(false);
      audioRef.current.onerror = () => {
        setPlaying(false);
        setLoading(false);
        alert("Audio failed to load. Please check your connection.");
      };
    }

    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      setLoading(true);
      audioRef.current.play()
        .then(() => {
          setPlaying(true);
          setLoading(false);
        })
        .catch(e => {
          console.error("Audio playback error:", e);
          setLoading(false);
          alert("Click again to enable audio playback in your browser.");
        });
    }
  };

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  return (
    <div className={`p-6 rounded-2xl border transition-all flex items-center justify-between group ${playing ? 'bg-primary-50 border-primary-200 shadow-md' : 'bg-white border-gray-100 hover:border-primary-100 hover:shadow-sm'}`}>
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${playing ? 'bg-primary-500 text-white animate-pulse' : 'bg-gray-100 text-gray-400 group-hover:bg-primary-50 group-hover:text-primary-400'}`}>
          <Music size={20} />
        </div>
        <div>
          <h4 className="font-bold text-text-800">{sound.name}</h4>
          <p className="text-xs text-text-400 uppercase font-semibold">Ambient Sound</p>
        </div>
      </div>
      <button 
        onClick={toggle}
        disabled={loading}
        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${playing ? 'bg-primary-600 text-white shadow-lg' : 'bg-gray-50 text-text-600 hover:bg-primary-500 hover:text-white shadow-sm'}`}
      >
        {loading ? (
          <div className="w-5 h-5 border-2 border-t-transparent border-current rounded-full animate-spin"></div>
        ) : playing ? (
          <Pause size={20} fill="currentColor" />
        ) : (
          <Play size={20} className="ml-1" fill="currentColor" />
        )}
      </button>
    </div>
  );
}
