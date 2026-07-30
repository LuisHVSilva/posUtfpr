import {t} from "@shared/messages/translation.message.ts";
import {ErrorMessage} from "@shared/messages/error.message.ts";
import {StringUtil} from "@shared/utils/string.util.ts";
import {toastService} from "@shared/services/toast.service.ts";

export class FormUtil {
    public getFormValue(formData: FormData, key: string): string {
        const value: FormDataEntryValue | null = formData.get(key);
        if (value === null || value === "") {
            toastService.error(t(ErrorMessage.nullFieldError.required, {field: key}));
            return "";
        }
        return value.toString();
    }

    public getFormValueNumber(formData: FormData, key: string): number {
        const value = this.getFormValue(formData, key);

        if (value === null || value === "") {
            return -1;
        }

        return StringUtil.strToNumber(value);
    }

    public getOptionalValue(formData: FormData, key: string): string | undefined {
        return formData.get(key)?.toString();
    }

    public formatDateFromApi(date?: string): string {
        if (!date) {
            return '';
        }

        const trimmed = date.trim();

        if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
            return trimmed.slice(0, 10);
        }

        if (/^\d{2}\/\d{2}\/\d{4}$/.test(trimmed)) {
            const [day, month, year] = trimmed.split('/');
            return `${year}-${month}-${day}`;
        }

        return '';
    }

    public getFormValueFromCheckbox(formData: FormData, key: string): boolean {
        const v = formData.get(key);
        if (v === null) return false;
        const s = v.toString().toLowerCase();
        return s === "on" || s === "true" || s === "1";
    }

}

export const formUtil = new FormUtil();