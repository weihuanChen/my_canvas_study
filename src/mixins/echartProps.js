
export default {
  props: {
    width: {
      type: String,
      default: "100%"
    },
    height: {
      type: String,
      default: "100%"
    }
  },
  data() {
    return {
      chartStyle:{
        width: this.width,
        height: this.height
      }
    };
  }
  
};