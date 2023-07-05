import { defineStore } from "pinia";

const useSelectStore = defineStore('store', {
    state: () => ({
        selectItem: 0
    }),
    actions: {
        setSelect(e){
            this.selectItem = e
        }
    }
})
export default useSelectStore;