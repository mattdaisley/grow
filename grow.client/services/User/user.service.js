

const UserService = {
  GetUser: () => {
    let value = ""

    if (typeof window !== "undefined") {
      value = localStorage.getItem("userName") || ""
    }

    return value;
  },

  SetUser: (value) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("userName", value)
    }
  }
}

export default UserService