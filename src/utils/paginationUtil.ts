interface PaginationOptions<T> {
    data: T[];
    page: number;
    itemsPerPage: number;
    formatItem: (item: T, index: number) => string;
    maxMessageLength?: number;
}

interface PaginationResult {
    messages: string[];
    currentPage: number;
    totalPages: number;
    isEmpty: boolean;
}

export class PaginationUtil {
    static async paginateData<T>(options: PaginationOptions<T>): Promise<PaginationResult> {
        const {
            data,
            page,
            itemsPerPage,
            formatItem,
            maxMessageLength = 250
        } = options;

        if (!data?.length) {
            return {
                messages: [],
                currentPage: 0,
                totalPages: 0,
                isEmpty: true
            };
        }

        const totalPages = Math.ceil(data.length / itemsPerPage);
        const currentPage = Math.min(Math.max(1, page), totalPages);
        const startIdx = (currentPage - 1) * itemsPerPage;
        const endIdx = Math.min(startIdx + itemsPerPage, data.length);

        const currentPageItems = data.slice(startIdx, endIdx);
        const messages: string[] = [];
        let currentMessage = "";

        currentPageItems.forEach((item, index) => {
            const globalIndex = startIdx + index + 1;
            const formattedItem = formatItem(item, globalIndex);

            if ((currentMessage + formattedItem).length > maxMessageLength) {
                if (currentMessage) {
                    messages.push(currentMessage.trim());
                }
                currentMessage = formattedItem;
            } else {
                currentMessage += formattedItem;
            }
        });

        if (currentMessage) {
            messages.push(currentMessage.trim());
        }

        return {
            messages,
            currentPage,
            totalPages,
            isEmpty: false
        };
    }
}