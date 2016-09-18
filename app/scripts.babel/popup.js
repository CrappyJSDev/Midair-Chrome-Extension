'use strict';

(function(){
class popup {
    constructor(){

        this.servers;
        this.pugs;
        this.serverTotal;
        this.favourite;
        this.activePage;
        this.selectedPug;
        this.activeGame;
        this.pugs;
        this.onlyActive;
    };

    getServerList(){
        chrome.storage.sync.get(['servers', 'serverTotal', 'pugs', 'favourite', 'onlyActive'], (storageObject) => {

            this.servers = storageObject.servers;
            this.serverTotal = storageObject.serverTotal;
            this.pugs = storageObject.pugs;
            this.favourite = storageObject.favourite;
            this.activePage = this.favourite;
            this.onlyActive = storageObject.onlyActive || false;

            if(this.onlyActive){
                $('#activeServers').prop('checked', true);
            } else {
                $('#activeServers').prop('checked', false);
            }

            this.setTitles();
            this.renderContent();
        });
    };

    clearCache(){
        chrome.storage.sync.remove(['servers', 'serverTotal', 'pugs', 'favourite', 'onlyActive']);
    };

    setTitles(){
        const base = this.getSelectedPug('Base');
        const LCTF = this.getSelectedPug('LCTF');
        const LCTFEU = this.getSelectedPug('LCTFEU');

        $('#title').text('Servers (' + this.serverTotal + ')' );
        $('#LCTF-title').text(LCTF.queue_name + ' (' + LCTF.current_players + '/' + LCTF.max_players + ')' );
        $('#Base-title').text(base.queue_name + ' (' + base.current_players + '/' + base.max_players + ')' );
        $('#LCTFEU-title').text(LCTFEU.queue_name + ' (' + LCTFEU.current_players + '/' +LCTFEU.max_players + ')' );
        $('#Pug-title').text('Pugs');

    }

    setOnlyActive(){
        if(this.onlyActive){
            this.onlyActive = false;
        } else {
            this.onlyActive = true;
        }

        chrome.storage.sync.set({onlyActive: this.onlyActive});

        $('#Servers-table-body').empty();
        this.setServerTable();
    }

    setServerTable(){
        $('#' + this.activePage).show();
        $('#' + this.activePage + '-content').show();
        $('#' + this.activePage + '-content').css('cursor', 'default');

        $('#title').text(this.activePage + ' (' + this.serverTotal + ')' );

        $('#' + this.activePage + '-table').css('top', '1px');
        $('#icon').removeClass('fa-arrow-right fa-2x');
        $('#icon').addClass('fa-arrow-left fa-2x');

        this.servers.forEach((server) => {
            if(this.onlyActive){
                if(server.players > 0){
                    $('#' + this.activePage + '-table-body').append('<tr><td>' + server.name + '</td><td>' + server.players + '</td></tr>');
                }
            } else {
               $('#' + this.activePage + '-table-body').append('<tr><td>' + server.name + '</td><td>' + server.players + '</td></tr>'); 
            }
        });
        
    };

    setFavourite(favourite){
        $('#' + this.favourite + '-favourite').css('-webkit-text-stroke', '0px');
        $('#' + this.favourite + '-favourite').removeClass('fa-star fa-2x');
        $('#' + this.favourite + '-favourite').css('color', '#fff');
        chrome.storage.sync.set({favourite: favourite});

        this.favourite = favourite;

        this.renderFavourite();
    }

    getSelectedPug(queue){

        let selectedPug;

        this.pugs.forEach((pug) => {
            if(pug.queue_name === queue){
                selectedPug = pug;
            }
        });

        return selectedPug;
    };

    populatePugTable(){
        if(this.selectedPug.games[0]){
            this.selectedPug.games[0].users.forEach((user, i) => {
                if(this.selectedPug.players.length !== 0){
                    let player = this.selectedPug.players[i];

                    if(typeof(player) === 'undefined'){
                        player = '';
                    }

                  $('#' + this.activePage + '-table-body').append('<tr><td>' + player + '</td><td>' + user + '</td></tr>');  
                } else {
                    $('#' + this.activePage + '-table-body').append('<tr><td></td><td>' + user + '</td></tr>');
                }
            });
        } else {
            if(this.selectedPug.players){
                this.selectedPug.players.forEach((player) => {
                    $('#' + this.activePage + '-table-body').append('<tr><td>' + player + '</td></tr>');
                });
            }
        }
    }

    renderPug(name){
        this.selectedPug = this.getSelectedPug(name);
        this.activePage = this.selectedPug.queue_name;

        $('#' + this.activePage).show();
        $('#' + this.activePage + '-content').show();
        $('#' + this.activePage + '-content').css('cursor', 'default');
        

        $('#' + this.activePage + '-icon').removeClass('fa-arrow-right fa-2x');
        $('#' + this.activePage + '-icon').addClass('fa-arrow-left fa-2x');

        this.populatePugTable();
    };

    renderFavourite(){
        $('#Servers-favourite').addClass('fa-star-o fa-2x');
        $('#LCTF-favourite').addClass('fa-star-o fa-2x');
        $('#Base-favourite').addClass('fa-star-o fa-2x');
        $('#LCTFEU-favourite').addClass('fa-star-o fa-2x');

        $('#' + this.favourite + '-favourite').removeClass('fa-star-o fa-2x');
        $('#' + this.favourite + '-favourite').addClass('fa-star fa-2x');
        $('#' + this.favourite + '-favourite').css('color', '#FFFC84');
        $('#' + this.favourite + '-favourite').css('-webkit-text-stroke-width', '1px');
        $('#' + this.favourite + '-favourite').css('-webkit-text-stroke-color', '#FF9211');

        if(this.favourite !== 'Servers'){
            this.pugs.forEach((pug) => {
                if(pug.queue_name === this.favourite){
                    chrome.browserAction.setBadgeText({ text: String(pug.players.length) });
                    if(pug.players.length === 0){
                        chrome.browserAction.setBadgeBackgroundColor({ color: '#ff3300' });
                    } else {
                        chrome.browserAction.setBadgeBackgroundColor({ color: '#00cc00' });
                    }
                }
            });
        } else {
            chrome.browserAction.setBadgeText({ text: String(this.serverTotal) });
            if(this.serverTotal === 0 ){
                chrome.browserAction.setBadgeBackgroundColor({ color: '#ff3300' });
            } else {
                chrome.browserAction.setBadgeBackgroundColor({ color: '#00cc00' });
            }
        }
    };

    renderPugMenu(){
        this.hideContent()
        $('html').css('height', '296px');
        $(document.body).css('height', '296px');

        $('#LCTF').show();
        $('#Base').show();
        $('#LCTFEU').show();

        $('#LCTF-table-body').empty();
        $('#Base-table-body').empty();
        $('#LCTFEU-table-body').empty();   

        $('#LCTF-icon').addClass('fa-arrow-right fa-2x');
        $('#Base-icon').addClass('fa-arrow-right fa-2x');
        $('#LCTFEU-icon').addClass('fa-arrow-right fa-2x');

        this.setTitles();

        this.pugs.forEach((pug) => {
            if(pug.games[0]){
                $('#' + pug.queue_name).css('height', '75px');
                $('#' + pug.queue_name + '-title').append('<tr><td>' + pug.games.length + ' Active Game</td></tr>');
                $('#' + pug.queue_name + '-table').css('top', '-10px');
                $('#' + pug.queue_name + '-table').css('position', 'relative');
                this.activeGame = pug.games[0].players;
            }
        }); 
    }

    renderMenu(){
        $('html').css('height', '296px');
        $(document.body).css('height', '296px');
        $('#Servers').show();
        $('#Pug').show();
        $('#help').show();

        $('#Servers-table-body').empty();

        $('#icon').addClass('fa-arrow-right fa-2x');
        $('#Pug-icon').addClass('fa-arrow-right fa-2x');

        $('#title').text('Servers (' + this.serverTotal + ')' );
        $('#Pug-title').text('Pugs');

        this.setTitles();

    }

    renderContent(){
        this.hideContent();
        this.renderFavourite();

        switch(this.activePage){

        case 'Servers':
            this.setServerTable();
            break;

        case 'LCTF':
            this.renderPug(this.activePage);
            break;

        case 'Base':
            this.renderPug(this.activePage);
            break;

        case 'LCTFEU':
            this.renderPug(this.activePage);
            break;

        case 'Menu':
            this.renderMenu();
            break;
        }
    };

    hideContent(){
        $('#Servers').hide();
        $('#Pug').hide();
        $('#Servers-content').hide();
        $('#LCTF').hide();
        $('#LCTF-content').hide();
        $('#Base').hide();
        $('#Base-content').hide();
        $('#LCTFEU').hide();
        $('#LCTFEU-content').hide();
        $('#help').hide();

        $('#icon').removeClass('fa-arrow-left fa-2x')
        $('#icon').addClass('fa-arrow-right fa-2x');

    }

}

$(document).ready(function(){
    const newpopup = new popup();

    newpopup.getServerList(); 

    $('#Servers-favourite').click(function(){
        newpopup.setFavourite('Servers');
    });

    $('#LCTF-favourite').click(function(){
        newpopup.setFavourite('LCTF');
    });

    $('#Base-favourite').click(function(){
        newpopup.setFavourite('Base');
    });

    $('#LCTFEU-favourite').click(function(){
        newpopup.setFavourite('LCTFEU');
    });   

    $('#Servers-click').click(function(){
        if(newpopup.activePage === 'Menu'){
            newpopup.activePage = 'Servers';
        } else {
            newpopup.activePage = 'Menu';
        }
        newpopup.renderContent();
    });

    $('#LCTF-click').click(function(){
        if(newpopup.activePage === 'Menu'){
            newpopup.activePage = 'LCTF';
        } else {
            newpopup.activePage = 'Menu';
        }
        newpopup.renderContent();
    });

    $('#Base-click').click(function(){
        if(newpopup.activePage === 'Menu'){
            newpopup.activePage = 'Base';
        } else {
            newpopup.activePage = 'Menu';
        }
        newpopup.renderContent();
    });

    $('#LCTFEU-click').click(function(){
        if(newpopup.activePage === 'Menu'){
            newpopup.activePage = 'LCTFEU';
        } else {
            newpopup.activePage = 'Menu';
        }
        newpopup.renderContent();
    });

    $('#activeServers').click(function(){

        newpopup.setOnlyActive();
    });

    $('#Pug-click').click(function(){
        newpopup.renderPugMenu();
    });

    $('#clear-cache').click(function(){
        newpopup.clearCache();
    });

});

}());