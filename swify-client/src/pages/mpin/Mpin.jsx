import { useState } from "react";
import { Check, KeyRound } from "lucide-react";
import Topbar from "../../components/layout/Topbar";
import MpinPad from "../../components/mpin/MpinPad";
import Button from "../../components/common/Button";
import { useAuth } from "../../context/AuthContext";
import { createMpin, changeMpin } from "../../api/mpin.api";
import "./Mpin.css";

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
      <div className="mpin-page">
        <div className="mpin-page__card">
          {isSet ? <ChangeMpinFlow /> : <CreateMpinFlow onDone={() => setUser((u) => ({ ...u, isMpinSet: true }))} />}
        </div>
      </div>
    </>
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
    return (
      <div className="mpin-page__done">
        <span className="mpin-page__done-icon">
          <Check size={22} />
        </span>
        <h2>MPIN created</h2>
        <p>You're all set to send money securely.</p>
      </div>
    );
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
    return (
      <div className="mpin-page__done">
        <span className="mpin-page__done-icon">
          <Check size={22} />
        </span>
        <h2>MPIN updated</h2>
        <p>Use your new MPIN on your next payment.</p>
      </div>
    );
  }

  const labels = { old: "Enter your current MPIN", new: "Choose a new MPIN", confirm: "Confirm your new MPIN" };

  return (
    <MpinPad value={value} onChange={handleChange} error={error} label={loading ? "Updating…" : labels[stage]} />
  );
}
