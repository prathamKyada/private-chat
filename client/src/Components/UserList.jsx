import React from "react";

const UserList = ({ users, onCreateRoom }) => {
  const loggedInUser = JSON.parse(sessionStorage.getItem("user"));
  console.log("user > ", users.user_id)
// sessionStorage.setItem("to_user_id", )
  return (
    <div id="user-list" className="user-list">
      <ul>
        {users.map((user) =>
          loggedInUser.user_id !== user.user_id ? (
            <li key={user.user_id} onClick={() => onCreateRoom(user.user_id)}>
              {user.user_full_name}
            </li>
          ) : null
        )}
      </ul>
    </div>
  );
};

export default UserList;
