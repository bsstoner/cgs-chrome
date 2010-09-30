Player = {
    play: function(filename, desc){
        var context = this;

        if (this.statInt){
            clearInterval(this.statInt);
        }

        this.audio = new Audio(filename);
        this.audio.play();

        /*
        this.audio.addEventListener("progress", function(lengthComputable, loaded, total) { 
            $("#playBarLoading").css("width", (loaded / total) + "%");
        });
        */
        
        $("#playButton").text(5);
        $("#episodeDesc").html("<p>" + desc + "</p>");
        
        $("#episodeCurSpot").html("00:00");
        $("#episodeDuration").html(this.audio.duration);
        
        this.statInt = setInterval(function(){
            $("#progress").css('width', (context.audio.currentTime / context.audio.duration) * 100 + "%");
            $("#episodeCurSpot").html(context.secondsToTime(context.audio.currentTime));
            $("#episodeDuration").html(context.secondsToTime(context.audio.duration));
        }, 30 / 1000);
    },
        
    togglePause: function(){
        if (this.audio && this.audio.paused){
            this.audio.play();
            $("#playButton").text(5);
        } else {
            this.audio.pause();
            $("#playButton").text(4);
        }
        
    },

    seekTo: function(percentSeek){
        if (this.audio && this.audio.duration){
            this.audio.currentTime = this.audio.duration * percentSeek;
        }
    },

    secondsToTime: function(sec){
        if (!sec){
            return "00:00";
        }
        
        if (sec < 60){
            return "00:" + ((sec<10) ? "0" + Math.floor(sec) : Math.floor(sec));
        }

        if (sec < (60 * 60)) {
            var min = Math.floor(sec / 60),
                leftoverSec = Math.floor(sec - (min*60));
            return ((min<10) ? "0" + min : min) + ":" + ((leftoverSec<10) ? "0" + leftoverSec : leftoverSec);
        }
        
        var hour = Math.floor(sec / (3600)),
            min = Math.floor((sec-(hour*3600)) / 60),
            leftoverSec = Math.floor(sec - (min*60) - (hour*3600));
        
        return "0" + hour + ":" + ((min<10) ? "0" + min : min) + ":" + ((leftoverSec<10) ? "0" + leftoverSec : leftoverSec);
    }
}
var episodePlayer = Object.create(Player);


Episode = {
    init: function(divId, data){
        // bind data to the Episode object:
        for(var d in data){
            this[d] = data[d];
        }
        
        $("#" + divId).append(this.render());
        this.registerEvents();
    },
    
    render: function(divId){
        return [
            '<li class="episodeWrapper">',
                '<img class="episodePic" src="',this.image,'" />',
                '<div class="episodeDetailsWrapper">',
                    '<span class="episodeNumber">',this.number,'</span>',
                    '<span class="episodeName">',this.episodeName,'</span>',
                    '<span class="episodeDate">',this.date,'</span>',
                    '<p class="episodeDesc">',this.shortDescription,'</p>',
                '</div>',
                '<ul>',
                    '<li><a id="',this.id,'_play" class="playEpisode button" title="Listen to Episode"><span>></span> Play Episode</a></li>',
                    '<li><a id="',this.id,'_details" target="_blank" href="',this.filename,'" class="episodeDetails button"><span>p</span> Show Notes</a></li>',
                    '<li><a id="',this.id,'_discuss" target="_blank" href="',this.forumLink,'" class="episodeDiscussion button"><span>q</span> Episode Discussion</a></li>',
                '</ul>',
            '</li>'
        ].join("");
    },
    
    registerEvents: function(){
        var context = this;

        $('#' + this.id + '_play').click(function(){
            console.log("clicked", context);
            episodePlayer.play(context.link, context.episodeName);
        });
    }
}

$(document).ready(function(){
    
    var renderEpisodes = function(data){
        if (data){
            for(var i=0;i<data.length;i++){
                var ep = Object.create(Episode);
                ep.init("latestEpisodes", data[i]);
            }
        }
    }
    
    $("#playButton").click(function(){
        episodePlayer.togglePause();
    });
    
    $("#playBar").click(function(e){
        console.log(e);
        console.log($(this).offset());
        console.log($(this).outerWidth());
        var pixels = e.clientX - $(this).offset().left;
        console.log(pixels);
        var perc = pixels / $(this).outerWidth();
        console.log(perc);
        episodePlayer.seekTo(perc);
    });
    

    var xhr = new XMLHttpRequest();
    xhr.open("GET", "http://www.comicgeekspeak.com/api/latestEpisode.php?count=10", true);
    xhr.onreadystatechange = function(){
        if (xhr.readyState == 4){
            renderEpisodes(JSON.parse(xhr.responseText))
        }
    }
    xhr.send();
    
});