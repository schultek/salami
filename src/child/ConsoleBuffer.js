
let buffer = []
//
// let interval = setInterval(() => {
//   flush()
// }, 100)

function flush() {
  // if (buffer.length > 0)
  //   console.log(buffer.join("\n"))
  // buffer = [];
}

export default {
  log(...args) {
    console.log(...args)
    // buffer.push(args.map(a =>
    //   typeof a === "string" ? a :
    //   typeof a === "number" ? a.toString() :
    //   JSON.stringify(a)
    // ).join(" "))
  },
  flush
}
