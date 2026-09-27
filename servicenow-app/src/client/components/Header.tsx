import React from 'react'
import { LOGO_DATA_URI } from '../assets/logo.ts'

export default function Header({ updatedAt }: { updatedAt?: string }) {
    const when = updatedAt ? new Date(updatedAt).toLocaleString('pt-BR') : '—'
    return (
        <header className="rf-header">
            <div className="rf-header__inner">
                <img className="rf-header__logo" src={LOGO_DATA_URI} alt="Logo NowRFID" />
                <div>
                    <h1 className="rf-header__title">NowRFID</h1>
                    <p className="rf-header__subtitle">Painel de cadastramento RFID</p>
                </div>
                <div className="rf-header__meta" aria-live="polite">
                    Atualizado em
                    <br />
                    {when}
                </div>
            </div>
            <div className="rf-header__accent" />
        </header>
    )
}
