import React, { Component } from 'react';
import Image from 'react-retina-image';
import accountStore from '../stores/AccountStore';
import {t} from '../utils/localizationUtil';

const ConnectedStatus = () => (
    <div>
        <Image className="figure connected" src="Figure.png"/>
        <p className="connected">{t('connected!')}</p>
        <span>{t('Your internet traffic is now encrypted! and your online identity has become anonymous.')}</span>
    </div>
);

const DisconnectedStatus = () => (
    <div>
        <Image className="figure disconnected" src="Figure.png"/>
        <p className="disconnected">{t('not connected!')}</p>
        <span>{t('Your internet traffic is unencrypted and your online identity is exposed.')}</span>
    </div>
);

class Header extends Component {
    constructor( props ) {
        super( props );

        this.state = {
            connected: false
        };

        this.update = () => {
            this.setState({
                connected: accountStore.getState().connected
            });
        }
    }

    componentWillMount() {
        accountStore.listen( this.update );
    }

    componentWillUnmount() {
        accountStore.unlisten( this.update );
    }

    render() {
        let { connected  } = this.state;

        return (
            <header>
                <Image className="logo" src="Logo.png"/>
                <div className="status">
                    {connected ? <ConnectedStatus /> : <DisconnectedStatus />}
                </div>
            </header>
        );
    }
}

export default Header;