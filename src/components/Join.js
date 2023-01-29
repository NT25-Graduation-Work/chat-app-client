import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { default as socket } from "./ws";

function Join() {
  const [nickname, setNickname] = useState();
  const history = useHistory();
  const handleOnClick = () => history.push(`/chat/${nickname}`);

  useEffect(() => {
    localStorage.setItem("chatConnected", "true");
  }, []);

  const submitNickname = () => {
    socket.emit("user nickname", nickname);
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="grid place-items-center my-auto">
        <h1 className="font-bold text-4xl pb-10 antialiased">
          Chat App
        </h1>
        <form className="flex w-full max-w-sm space-x-3 justify-center">
          <div className="relative ">
            <input
              type="text"
              onChange={(e) => setNickname(e.target.value)}
              className="input input-bordered w-full max-w-xs"
              placeholder="Nickname"
            />
          </div>
          <button
            className="btn"
            onClick={() => {
              submitNickname();
              handleOnClick();
            }}
            type="submit"
          >
            Join
          </button>
        </form>
      </div>
    </div>
  );
}

export default Join;
