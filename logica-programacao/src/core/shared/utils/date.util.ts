export class DateUtil {
    private static readonly BRAZIL_TIME_ZONE = "America/Sao_Paulo";
    private static readonly BRAZIL_OFFSET = "-03:00";

    static now(): Date {
        return new Date();
    }

    static parse(value: string | Date): Date {
        if (value instanceof Date) {
            return new Date(value.getTime());
        }

        if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
            return new Date(`${value}T00:00:00${DateUtil.BRAZIL_OFFSET}`);
        }

        return new Date(value);
    }

    static today(): Date {
        const parts = new Intl.DateTimeFormat("en-CA", {
            timeZone: DateUtil.BRAZIL_TIME_ZONE,
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
        }).formatToParts(new Date());

        const dateParts = Object.fromEntries(
            parts
                .filter(({type}) => type !== "literal")
                .map(({type, value}) => [type, value]),
        );

        return DateUtil.parse(
            `${dateParts.year}-${dateParts.month}-${dateParts.day}`,
        );
    }
}
