import type { AddressItem } from '@/types/address'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAddressStore = defineStore('address', () => {
  const selectedAddresss = ref<AddressItem>()

  const changeSelectedAddresss = (val: AddressItem) => {
    selectedAddresss.value = val
  }
  return {
    selectedAddresss,
    changeSelectedAddresss,
  }
})
