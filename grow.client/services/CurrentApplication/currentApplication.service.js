

const CurrentApplicaiton = {
  GetCurrentApplication: () => {
    let value = ""

    if (typeof window !== "undefined") {
      value = localStorage.getItem("currentApplicaiton") || ""
    }

    return value;
  },

  SetCurrentApplicaiton: (value) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("currentApplicaiton", value)
    }
  }
}

export default CurrentApplicaiton