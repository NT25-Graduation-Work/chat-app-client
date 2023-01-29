import React, { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useParams, useHistory } from "react-router-dom";
import { default as socket } from "./ws";
import UserOnline from "./UserOnline";
import { GrSend } from "react-icons/gr";

function Chat() {
  let { user_nickName } = useParams();
  const [nickname, setNickname] = useState("");
  const [msg, setMsg] = useState("");
  const [chat, setChat] = useState([]);
  const [usersOnline, setUsersOnline] = useState([]);
  const [toUser, setToUser] = useState("");
  const history = useHistory();

  useEffect(() => {
    if (!localStorage.getItem("chatConnected")) {
      history.push(`/`);
    }

    window.addEventListener("beforeunload", () =>
      localStorage.removeItem("chatConnected")
    );

    setNickname(user_nickName);
    socket.on("chat message", ({ nickname, msg }) => {
      setChat([...chat, { nickname, msg }]);
    });

    socket.on("private msg", ({ id, nickname, msg }) => {
      setChat([...chat, `🔒 Private Message from ${nickname}: ${msg}`]);
    });

    let objDiv = document.getElementById("msg");
    objDiv.scrollTop = objDiv.scrollHeight;

    return () => {
      socket.off();
    };
  }, [chat, toUser, user_nickName, history]);

  useEffect(() => {
    socket.on("connect", () => {
      socket.emit("new-user");
    });

    socket.on("users-on", (list) => {
      setUsersOnline(list);
    });

    socket.on("welcome", (user) => {
      setChat([...chat, `Welcome to our chat ${user}`]);
    });

    socket.on("user-disconnected", (user) => {
      if (user !== null) {
        setChat([...chat, `${user} left the chat 👋🏻`]);
      }
    });

    return () => {
      socket.off();
    };
  }, [chat]);

  const submitMsg = (e) => {
    e.preventDefault();

    if (msg === "") {
      toast("Enter a message.", {
        duration: 4000,
        // Styling
        style: {},
        className: "alert alert-error shadow-lg",
        // Custom Icon
        icon: "⚠️",
        // Aria
        role: "status",
        ariaLive: "polite",
      });
    } else if (toUser === nickname) {
      toast("Select a different user.", {
        duration: 4000,
        // Styling
        style: {},
        className: "alert alert-error shadow-lg",
        // Custom Icon
        icon: "⚠️",
        // Aria
        role: "status",
        ariaLive: "polite",
      });
    } else if (toUser !== "") {
      let selectElem = document.getElementById("usersOn");
      selectElem.selectedIndex = 0;
      socket.emit("chat message private", { toUser, nickname, msg });
      setChat([...chat, { nickname, msg }]);
      setChat([...chat, `🔒 Private Message for ${toUser}: ${msg}`]);
      setMsg("");
      setToUser("");
    } else {
      socket.emit("chat message", { nickname, msg });
      setChat([...chat, { nickname, msg }]);
      setMsg("");
    }
  };

  const saveUserToPrivateMsg = (userID) => {
    setToUser(userID);
  };

  return (
    <div className="flex w-screen main-chat lg:h-screen divide-solid w-full h-full">
      <Toaster />
      <div className="flex w-full lg:w-5/6 lg:h-5/6 lg:mx-auto lg:my-auto">
        {/* Users online */}
        <div className="hidden lg:block pl-4 pr-4 w-64">
          <p className="font-black my-4 text-xl">
            {" "}
            Online: ({usersOnline !== null ? usersOnline.length : "0"}):
          </p>
          <ul className="">
            {usersOnline !== null
              ? usersOnline.map((el, index) => (
                  <button
                    key={index}
                    onClick={() => saveUserToPrivateMsg(el)}
                    className="menu bg-base-100 w-56 rounded-box"
                  >
                    <UserOnline nickname={el} />
                  </button>
                ))
              : ""}
          </ul>
        </div>
        <div className="flex flex-col flex-grow lg:max-w-full">
          {/* Messages */}
          <p className="mt-4 mb-2 pl-4 lg:pl-8 text-2xl">
            Main Chat
          </p>
          <div
            id="msg"
            className="h-5/6 overflow-y-auto pl-4 lg:pl-8 pt-4 mb-2 lg:mb-0"
          >
            <ul className="">
              {chat.map((el, index) => (
                <li
                  key={index}
                  className="w-screen break-words pr-6 lg:pr-0 lg:w-full"
                >
                  {el.nickname != null ? (
                    `${el.nickname}: ${el.msg}`
                  ) : (
                    <p className="text-base font-semibold rounded py-1">
                      {el}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </div>
          <form className="flex justify-center form-control">
            <div className="input-group">
              <select
                className="select select-bordered"
                id="usersOn"
                onChange={(e) => saveUserToPrivateMsg(e.target.value)}
              >
                <option value="" className="">
                  Everyone
                </option>
                {usersOnline !== null
                  ? usersOnline.map((el, index) => (
                      <option value={el} className="" key={index}>
                        {el}
                      </option>
                    ))
                  : ""}
              </select>
              <input
                  type="text"
                  className="input input-bordered w-full max-w-xs"
                  name="message"
                  onChange={(e) => setMsg(e.target.value)}
                  value={msg}
                />
                <button
                  className="btn"
                  onClick={(e) => submitMsg(e)}
                >
                  <GrSend />
                </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Chat;
