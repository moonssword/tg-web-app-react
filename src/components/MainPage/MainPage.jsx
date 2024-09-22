import React from 'react';
import './MainPage.css'
import { Link } from 'react-router-dom';
import { useTelegram } from '../../hooks/useTelegram';

const MainPage = () => {
    return (
        <div className="main-page">
            <h1></h1>
            <Link to="/form">
                <button className="navigate-button">Разместить объявление</button>
            </Link>
        </div>
    );
};

export default MainPage;