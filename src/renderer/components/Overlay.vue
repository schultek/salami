<template>
  <div id="overlay">
    <span>Laden</span>
  </div>
</template>

<script>

import $ from "jquery"

export default {
  methods: {
    fadeOut() {
      $("#overlay").fadeOut(800)
    }
  }
}

</script>

<style>

#overlay {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  position: fixed;
  background: #f7f7f7;
  font-weight: 400;
  letter-spacing: 10px;
  text-transform: uppercase;
}

#overlay span {
  padding-left: 10px;
}

#overlay:after {
  content: "";
  display: block;
  background: #505050;
  height: 2px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-65px,15px);
  animation: loading 5s linear;
}

@keyframes loading {
  0% {
    width: 0px;
  }
  100% {
    width: 130px;
  }
}


</style>
