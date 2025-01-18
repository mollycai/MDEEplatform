import { hasRole } from '@/utils/auth';
import type { DirectiveBinding } from 'vue';

export default {
  mounted(el: HTMLElement, binding: DirectiveBinding<Array<string>>) {
    const { value } = binding;
    if (value) {
      !hasRole(value) && el.parentNode?.removeChild(el);
    } else {
      throw new Error("[Directive: roles]: need roles! Like v-roles=\"['btn.add','btn.edit']\"");
    }
  },
};
