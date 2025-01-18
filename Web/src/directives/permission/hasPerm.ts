import { hasPermissions } from '@/utils/auth';
import type { DirectiveBinding } from 'vue';

export default {
  mounted(el: HTMLElement, binding: DirectiveBinding<Array<string>>) {
    const { value } = binding;
    if (value) {
      !hasPermissions(value) && el.parentNode?.removeChild(el);
    } else {
      throw new Error("[Directive: perms]: need perms! Like v-perms=\"['btn.add','btn.edit']\"");
    }
  },
};
