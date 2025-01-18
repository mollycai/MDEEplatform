import { DialogTypeEnum } from '@/enums/dataEnum';

export type DialogStatus = DialogTypeEnum.EDIT | DialogTypeEnum.CREATE;

export type MenuTreeSelect = {
  id: number;
  label: string;
  children: MenuTreeSelect[];
  disabled?: boolean;
};
