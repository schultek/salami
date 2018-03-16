
export default {
  iterator: null,
  running: false,
  queue: [],
  paused: false,
  abort: false,
  state: null,
  run(generator, callback) {
    this.running = true;
    this.paused = false;
    let initial = !this.iterator;
    this.iterator = generator();

    if (initial) {

      let next = (itr, next, finish, result) => {

        if (this.abort) {
          console.log("Aborting...")
          if (this.state.run)
            this.state.run()
          this.reset()
          return;
        }

        if (this.paused) {
          this.state = {resume: () => {
            this.state = null
            setImmediate(next, itr, next, finish)
          }}
          return;
        }

        if (!this.running) {
          this.reset()
          if (finish) finish()
          return;
        }

        let i = itr.next(result)
        if (i.done) {
          if (finish)
            finish(i.value)
          if (this.queue.length > 0) {
            let item = this.queue.shift()
            setImmediate(this.run.bind(this), item.generator, item.callback)
          }
        } else {
          if (!i.value) {
            setImmediate(next, itr, next, finish)
          } else {
            setImmediate(next, i.value, next, (result) => {
              setImmediate(next, itr, next, finish, result)
            })
          }
        }
      }
      let finish = (value) => {
        this.reset()
        if (callback)
          callback(value);
      }

      setImmediate(next, this.iterator, next, finish)

    } else {
      this.abort = true;
      this.state = {run: () => {
        setImmediate(this.run.bind(this), generator, callback)
      }}
    }
  },
  add(generator, callback) {
    if (!this.running)
      this.run(generator, callback)
    else
      this.queue.push({generator, callback})
  },
  pause() {
    console.log("Pausing...")
    this.paused = true;
  },
  resume() {
    console.log("Resuming...")
    if (this.paused && this.state) {
      this.paused = false;
      this.state.resume()
    }
  },
  stop() {
    this.running = false;
    if (this.paused) {
      this.reset();
    }
  },
  reset() {
    this.iterator = null;
    this.state = null;
    this.abort = false;
    this.paused = false;
    this.running = false;
    this.queue = [];
  }
}
