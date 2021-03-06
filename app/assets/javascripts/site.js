// Put your application scripts here
(function($){

  var url1 = /(^|&lt;|\s)(www\..+?\..+?)(\s|&gt;|$)/g,
      url2 = /(^|&lt;|\s)(((https?|ftp):\/\/|mailto:).+?)(\s|&gt;|$)/g,

      linkifyThis = function () {
        var childNodes = this.childNodes,
            i = childNodes.length;
        while(i--)
        {
          var n = childNodes[i];
          if (n.nodeType == 3) {
            var html = $.trim(n.nodeValue);
            if (html)
            {
              html = html.replace(/&/g, '&amp;')
                         .replace(/</g, '&lt;')
                         .replace(/>/g, '&gt;')
                         .replace(url1, '$1<span>&nbsp;</span><a target="_blank" href="http://$2">$2</a>$3<span>&nbsp;</span>')
                         .replace(url2, '$1<span>&nbsp;</span><a target="_blank" href="$2">$2</a>$5<span>&nbsp;</span>');
              $(n).after(html).remove();
            }
          }
          else if (n.nodeType == 1  &&  !/^(a|button|textarea)$/i.test(n.tagName)) {
            linkifyThis.call(n);
          }
        }
      };

  $.fn.linkify = function () {
    return this.each(linkifyThis);
  };

  $.fn.enterKey = function (fnc) {
    return this.each(function () {
        $(this).keypress(function (ev) {
            var keycode = (ev.keyCode ? ev.keyCode : ev.which);
            if (keycode == '13') {
                fnc.call(this, ev);
            }
        })
    })
}

})(jQuery);

var fnGetCityForCoords;
var fnGetLocation;
var fnCreatePost;

$(document).ready(function() {
    var text_max = 500;
    var voted_posts = [];

    $.ajaxSetup({
      headers: {'HTTP_X_CSRF_TOKEN': $("[name='authenticity_token']").val()}
    });

    // tagcloud
    $.fn.tagcloud.defaults = {
      size: {start: 12, end: 22, unit: 'pt'},
      color: {start: '#BBB', end: '#d2322d'}
    };

    $('#categories a').tagcloud();

    //tooltips
    $(".has-tooltip").tooltip();

    $('#dropit_count').html(text_max);

    $('#dropit_input').keyup(function() {
        var text_length = $('#dropit_input').val().length;
        var text_remaining = text_max - text_length;

        if (text_remaining < 0)
        {
            $("#dropit_count").css('color', 'red');
        }            
        else
        {
            $("#dropit_count").css('color', '#999');
        }
            
        $('#dropit_count').html(text_remaining);
    });

    $('.vote').click(function(){
       var post_id = $(this).closest('.post').attr('id');
       var rating = $(this).attr('id');
       var el = $(this);
       $.post( "vote_post", { post_id: post_id, rating: parseInt(rating) + 1, authenticity_token: $("[name='authenticity_token']").val() }
        )
        .done(function() {
        })
        .fail(function() {
        })
        .always(function() {
            if (voted_posts.indexOf(post_id) < 0) {
                el.parent().find(".vote").css('color', 'black');
                var nvotecount = parseInt(el.parent().find(".vote-counter").text()) + 1;
                el.parent().find(".vote-counter").text(nvotecount);
                for (var i = rating; i >= 0; i--) {
                    el.parent().find(".vote#" + i).css('color', 'red');
                };

                voted_posts.push(post_id);
            };

        });
    });

    var tweetParser = function(){

        var linkToTwitter = function()
        {
            var tokens = $(this).text().split(' ');

            for (var i = tokens.length - 1; i >= 0; i--) {
                var token = tokens[i];

                if (token.indexOf("@") == 0) {
                    var newToken = '<a href="http://twitter.com/' + token.replace("@", "").replace(/\W+/g, " ") + 
                                        '" target="_blank">' + token + "</a>";
                    var currentHtml = $(this).html().replace(token, newToken);
                    $(this).html(currentHtml);
                };

                if (token.indexOf("#") == 0) {
                    var newToken = '<a href="http://twitter.com/' + token + '" target="_blank">' + token + "</a>";
                    var currentHtml = $(this).html().replace(token, newToken);
                    $(this).html(currentHtml);
                };
            };
        };

        $(".tweet-text").each(linkToTwitter);

        $('.tweet-username').each(linkToTwitter);
        $(".post-content").each(linkToTwitter);
    }

    fnCreatePost = function()
    {

       $.post( "create_post", { content: $("#dropit_input").val(), 
                        categories: $("#categories").val(), 
                        location_neighborhood: $("location_neighborhood").val(),
                        location_country: $("#location_country").val(),
                        authenticity_token: $("[name='authenticity_token']").val() }
        )
        .done(function(data) {
            data = jQuery.parseJSON(data);
            if (data.status == 0) {                
                $(".post-msg.error").text(data.message);
                $(".post-msg.error").show( "slide",  "slow" );
                $(".input-tag").hide();
            }
            else {
                $(".post-msg.success").text("tu mensaje será publicado en unos minutos.");
                $(".post-msg.success").show( "slide",  "slow" );
                $(".input-tag").hide();
                $("#dropit_input").val('');
                $("#dropit_input").blur();
            };
        })
        .fail(function() {
        })
        .always(function() {
            

        });
    }

    fnGetCityForCoords = function(lat, long){
        $.ajax({
            type: 'GET',
            dataType: "json",
            url: "http://maps.googleapis.com/maps/api/geocode/json?latlng="+lat+","+long+"&sensor=false&language=es",
            data: {},
            success: function(data) {
                $("#location_neighborhood").val(data.results[1].address_components[0].long_name);
                $("#location_country").val(data.results[1].address_components[3].long_name);
            },
            error: function () { console.log('error'); } 
        }); 
    }


    fnGetLocation = function(){
        if (navigator.geolocation) {
            navigator.geolocation.watchPosition(function (position) {
                    fnGetCityForCoords(position.coords.latitude, position.coords.longitude);
             });
        }
    }

    $(".filter-n").click(function(){ location.href = '/?f=n'});
    $(".filter-p").click(function(){ location.href = '/?f=p'});

    $(".row.title").click(function (){
        location.href = '/';
    });

    $(".tweet").linkify();
    $(".post-content").linkify();

    tweetParser();

    /*
    var category = getUrlVars()["c"];

    if (category === undefined || category.length == 0) 
    { $(".categories a").first().addClass('active'); }
    else {
      $(".categories a#" + category).first().addClass('active');
    }*/

    $('.multiselect').multiselect({buttonClass: 'btn btn-link', 
                                    nonSelectedText: 'agregar tags',
                                    numberDisplayed: 2,
                                    nSelectedText: 'seleccionados',
                                    onChange: function(element, checked) {
                                    if(checked == true) {
                                      // action taken here if true
                                      $("#categories").val($("#categories").val() + "," + element.val());
                                    }
                                    else {
                                        $("#categories").val($("#categories").val().replace(element.val(), ""));
                                    }                             
                                  }
                              });
    $(".input-tag").hide();

    // search
    $('#search-text').enterKey(function() { $('.btn-search').click() });
    $('.btn-search').click(function(){ 
        var searchEl = $('#search-text');

        if (searchEl.val().length > 0) {};
            location.href = '/search/' + searchEl.val();  
    });
    
    // create post
    $(".btn-create").click(function() {

        if (!$( "#dropit_input" ).is(':visible')) 
        {
            $( "#dropit_input" ).show( "fast");
        }
        else 
        {
            fnCreatePost();
        }
    });

    $("#dropit_input").focus(function() {
        $(this).animate({
            height: 84
        }, "normal");
        $(".input-tag").show('fast');
        $(".btn-create").html('<i class="glyphicon glyphicon-fire" ></i>&nbspBoom!');
        $(".post-msg.error").hide();
    }).blur(function() {
        if ($("#dropit_input").val().length == 0) {            
            $(".input-tag").hide('fast');
            $(this).hide('fast');
            $(".btn-create").html('<i class="glyphicon glyphicon-fire" ></i>&nbspMandar Mensaje');
        };
    });

    $(".btn-create").html('<i class="glyphicon glyphicon-fire" ></i>&nbspMandar Mensaje');


    fnGetLocation();
});

function getUrlVars()
{
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for(var i = 0; i < hashes.length; i++)
    {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }
    return vars;
}
