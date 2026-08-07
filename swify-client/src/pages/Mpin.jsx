import { useState } from "react";
import { Check } from "lucide-react";
import Topbar from "../components/Topbar";
import MpinPad from "../components/MpinPad";
import { useAuth } from "../context/AuthContext";
import { createMpin, changeMpin } from "../api/mpin.api";

export default function Mpin() {
  const { user, setUser } = useAuth();
  const isSet = !!user?.isMpinSet;

  return (
    <>
      <Topbar
        title={isSet ? "Change MPIN" : "Set up your MPIN"}
        subtitle={
          isSet
            ? "Confirm your current MPIN, then choose a new one."
            : "Your MPIN protects every payment you send."
        }
      />
      <div className="px-10 pt-2 pb-10 max-md:px-5 max-w-[480px]">
        <div className="bg-panel border border-hairline rounded-3xl p-10 px-7 flex justify-center">
          {isSet ? <ChangeMpinFlow /> : <CreateMpinFlow onDone={() => setUser((u) => ({ ...u, isMpinSet: true }))} />}
        </div>
      </div>
    </>
  );
}

function DoneState({ title, description }) {
  return (
    <div className="text-center">
      <span className="w-[52px] h-[52px] rounded-full bg-signal-soft text-signal grid place-items-center mx-auto mb-4">
        <Check size={22} />
      </span>
      <h2 className="m-0 mb-1.5 text-xl font-extrabold">{title}</h2>
      <p className="m-0 text-slate text-[0.88rem]">{description}</p>
    </div>
  );
}

function CreateMpinFlow({ onDone }) {
  const [stage, setStage] = useState("enter"); // enter | confirm | done
  const [first, setFirst] = useState("");
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = async (val) => {
    setValue(val);
    setError("");
    if (val.length !== 6) return;

    if (stage === "enter") {
      setFirst(val);
      setValue("");
      setStage("confirm");
      return;
    }

    if (val !== first) {
      setError("MPINs don't match. Start again.");
      setValue("");
      setFirst("");
      setStage("enter");
      return;
    }

    setLoading(true);
    try {
      await createMpin(val);
      setStage("done");
      onDone();
    } catch (err) {
      setError(err.message);
      setValue("");
      setFirst("");
      setStage("enter");
    } finally {
      setLoading(false);
    }
  };

  if (stage === "done") {
    return <DoneState title="MPIN created" description="You're all set to send money securely." />;
  }

  return (
    <MpinPad
      value={value}
      onChange={handleChange}
      error={error}
      label={loading ? "Setting up…" : stage === "enter" ? "Choose a 6-digit MPIN" : "Confirm your MPIN"}
    />
  );
}

function ChangeMpinFlow() {
  const [stage, setStage] = useState("old"); // old | new | confirm | done
  const [oldMpin, setOldMpin] = useState("");
  const [newMpin, setNewMpin] = useState("");
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = async (val) => {
    setValue(val);
    setError("");
    if (val.length !== 6) return;

    if (stage === "old") {
      setOldMpin(val);
      setValue("");
      setStage("new");
      return;
    }

    if (stage === "new") {
      if (val === oldMpin) {
        setError("New MPIN must be different from the old one.");
        setValue("");
        return;
      }
      setNewMpin(val);
      setValue("");
      setStage("confirm");
      return;
    }

    if (val !== newMpin) {
      setError("New MPIN didn't match. Try again.");
      setValue("");
      setStage("new");
      return;
    }

    setLoading(true);
    try {
      await changeMpin(oldMpin, val);
      setStage("done");
    } catch (err) {
      setError(err.message);
      setValue("");
      setStage("old");
      setOldMpin("");
      setNewMpin("");
    } finally {
      setLoading(false);
    }
  };

  if (stage === "done") {
    return <DoneState title="MPIN updated" description="Use your new MPIN on your next payment." />;
  }

  const labels = { old: "Enter your current MPIN", new: "Choose a new MPIN", confirm: "Confirm your new MPIN" };

  return (
    <MpinPad value={value} onChange={handleChange} error={error} label={loading ? "Updating…" : labels[stage]} />
  );
}
