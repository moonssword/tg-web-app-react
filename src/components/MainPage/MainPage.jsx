import React, { useEffect, useState } from 'react';
import Preloader from '../Preloader/Preloader';
import './MainPage.css'
import { Link } from 'react-router-dom';
import { useTelegram } from '../../hooks/useTelegram';

const MainPage = () => {
    const [showPreloader, setShowPreloader] = useState(false);

    useEffect(() => {
        // Проверяем, отображался ли Preloader
        const isFirstVisit = localStorage.getItem('isFirstVisit');
        if (!isFirstVisit) {
            setShowPreloader(true);
            localStorage.setItem('isFirstVisit', 'true');
        }

        // Добавляем обработчик для сброса ключа при закрытии окна
        const handleUnload = () => {
            localStorage.removeItem('isFirstVisit');
        };

        window.addEventListener('unload', handleUnload);

        // Очищаем обработчик при размонтировании компонента
        return () => {
            window.removeEventListener('unload', handleUnload);
        };
    }, []);
    
    return (
        <div className="main-page">
            {showPreloader && <Preloader />}
            <div className="button-container">
                <Link to="/form" state={{ from: 'main' }}>
                    <button className="navigate-button">Поиск/публикация объявлений</button>
                </Link>
                <Link to="/ads" state={{ from: 'main' }}>
                    <button className="navigate-button">Мои объявления</button>
                </Link>
                <Link to="/autosearch" state={{ from: 'main' }}>
                    <button className="navigate-button">Сохраненные поиски</button>
                </Link>
            </div>
        </div>
    );
};

export default MainPage;