import {useQuery} from "@tanstack/react-query";
import {pacientsService} from "../services/pacients.service";

export function usePacientsData() {
    return useQuery({
        queryKey: ["pacientsPageData"],
        queryFn: () => pacientsService.getPageData()
    });
}
