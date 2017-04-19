import _ from 'lodash';
import React from 'react';
import Select from 'react-select';
import T from 'i18n-react';
import ServersStore from '../stores/ServersStore';
import SettingsStore from '../stores/SettingsStore';
import SettingsActions from '../actions/SettingsActions';
import ConnectionStore from '../stores/ConnectionStore';
import ConnectionActions from '../actions/ConnectionActions';
import Logs from './Logs';

const Status = ({isConnecting, onConnect}) => {
    let status = T.translate( 'Loading...' );

    return (
        <section>
            <h1 className="title">{T.translate('VPN connection status')}</h1>
            <div className="connectionstatus">
                <i className={isConnecting ? 'ion-ios-loop spin' : 'ion-ios-close-empty disconnected'}></i>
                <p>{T.translate( isConnecting ? 'Connecting' : 'Disconnected' )}</p>
            </div>
            <button className="right" onClick={onConnect}>
                <p>{T.translate( isConnecting ? 'cancel' : 'connect to vpn')}</p>
            </button>
        </section>
    );
}

const Login = ({username, password, remember, onUpdate}) => (
    <section>
        <h1 className="title">{T.translate('Login')}</h1>
        <input name="username" value={username} onChange={({target}) => onUpdate( target.value, password, remember )} placeholder={T.translate('Username')} type="text" />
        <input name="password" value={password} onChange={({target}) => onUpdate( username, target.value, remember )} placeholder={T.translate('Password')} type="password" />
        <div className="checkbox">
            <input type="checkbox" value={remember} checked={remember} onChange={() => onUpdate( username, password, !remember)} id="saveCredentials" />
            <label htmlFor="saveCredentials">
                <p>{T.translate('Remember my username and password')}</p>
            </label>
        </div>
    </section>
);

class ServerItem extends React.Component {
    constructor( props ) {
        super();
    }

    render() {
        const { className, onFocus, onSelect, option } = this.props;
        const { name, country } = option;

        return (
            <div className={className} onClick={(e) => onSelect( option, e )} onMouseEnter={(e) => onFocus( option, e)}>
                <i className={`flag-icon flag-icon-${country}`} />
                {name}
            </div>
        );
    }
}

const Servers = ({servers, selected, onSelect}) => {
    servers = _.map( servers, item => _( item )
        .set( 'value', item.ip )
        .set( 'label', item.name )
        .value()
    );

    return (
        <section>
            <h1 className="title">{T.translate('Servers')}</h1>
            <Select
                name="server"
                placeholder={T.translate('Select server')}
                options={servers}
                optionComponent={ServerItem}
                value={selected}
                onChange={({ip}) => onSelect( ip )}
                searchable={false}
                clearable={false}
            />
        </section>
    )
}

class Authentication extends React.Component {
    constructor( props ) {
        super( props );

        const { servers } = ServersStore.getState();
        const { username, password, rememberCredentials } = SettingsStore.getState();

        this.state = {
            isConnecting: false,
            username,
            password,
            rememberCredentials,
            servers,
            selectedServer: 'hub.vpn.ht'
        };

        this.onUpdateCredentials = this.onUpdateCredentials.bind( this );
        this.onSelectServer = this.onSelectServer.bind( this );
        this.onConnect = this.onConnect.bind( this );
    }

    componentDidMount () {
        SettingsStore.listen( ({username, password, rememberCredentials}) => {
            this.setState({ username, password, rememberCredentials });
        });

        ServersStore.listen( ({servers}) => {
            this.setState({ servers });
        });

        ConnectionStore.listen( ({status}) => {
            this.setState({ isConnecting: status === 'connecting' });
        });
    }

    onUpdateCredentials( username, password, rememberCredentials ) {
        SettingsActions.update( 'rememberCredentials', rememberCredentials );
        SettingsActions.update( 'username', username );
        SettingsActions.update( 'password', password );
    }

    onSelectServer( ip ) {
        this.setState({ selectedServer: ip });
    }

    onConnect() {
        const { selectedServer } = this.state;
        ConnectionActions.connect( selectedServer );
    }

    render() {
        const { servers, selectedServer, isConnecting, username, password, rememberCredentials } = this.state;

        return (
            <div>
                <Status isConnecting={isConnecting} onConnect={this.onConnect}/>
                <Login server={selectedServer} username={username} password={password} remember={rememberCredentials} onUpdate={this.onUpdateCredentials} />
                <Servers servers={servers} selected={selectedServer} onSelect={this.onSelectServer} />
            </div>
        );
    }
}

export default Authentication;