import { useEffect, useRef } from "react";
import "./newPrompt.css";

const NewPrompt = () => {
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);
  return (
    <>
      TEST
      <div className="endChat" ref={endRef}></div>
      <div className="newPrompt">
        <form className="newForm">
          <label htmlFor="file">
            <img src="/attachment.png" alt="" />
          </label>
          <input id="file" type="file" multiple={false} hidden />
          <input type="text" placeholder="Ask me anything..." />
          <button>
            <img src="/arrow.png" alt="" />
          </button>
        </form>
      </div>
    </>
  );
};

export default NewPrompt;
