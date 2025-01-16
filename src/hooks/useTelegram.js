const tg = window.Telegram.WebApp;

export function useTelegram() {
    const onClose = () => {
        tg.close()
      }

    const onToggleButton = () => {
        if(tg.MainButton.isVisible) {
            tg.MainButton.hide();
        } else {
            tg.MainButton.show();
        }
    }
    
    const onBackButton = (callback) => {
        tg.BackButton.show();
        tg.BackButton.onClick(callback);
    };
    
    const hideBackButton = () => {
        tg.BackButton.hide();
    };
    
    return {
        onClose,
        onToggleButton,
        onBackButton,
        hideBackButton,
        tg,
        user: tg.initDataUnsafe?.user,
        queryId: tg.initDataUnsafe?.query_id,
    }
}