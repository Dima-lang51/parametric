document.addEventListener('DOMContentLoaded', function () {
  let apartments = [];
  let page = 1;
  let filtersBlock = document.querySelector('.apartment__filters');
  let filterRoomBtn = document.querySelectorAll('.btn__room');
  let table = document.querySelector('.apartments__table');
  let tableHeader = document.querySelector('.header__name');
  let tableHeaderMobile = document.querySelector('.header__name-mb');
  let restBtn = document.querySelector('.reset');
  let showMore = document.querySelector('.show__more');
  let showMoreCount = 20;
  let url_base = "http://localhost:3000/apartments"
  let priceRange = document.querySelector('.range__price');
  let priceRangeSlider = document.getElementById('price__slider');
  let squareRange = document.querySelector('.square__price');
  let squareRangeSlider = document.getElementById('square__slider');

  function hasMore(headers){
    
    var arr = headers.trim().split(/[\r\n]+/);

    var headerMap = {};
    arr.forEach(function (line) {
      var parts = line.split(': ');
      var header = parts.shift();
      var value = parts.join(': ');
      headerMap[header] = value;
    });
    if (headerMap.link.indexOf(rel="next") == -1){
      showMore.style.display = "none"
    }
    
  }

  const getData = (url, page, callback, reject = console.error) => {
    const request = new XMLHttpRequest();
    url = url_base + "?" +  url + '&_page=' + page + '&_limit=' + showMoreCount; 
    request.open('GET', url);

    request.addEventListener('readystatechange', () => {
      if (request.readyState !== 4) return;

      

      if (request.status === 200) {
      
        let headers = request.getAllResponseHeaders();
        hasMore(headers);
        callback(request.response)
      } else {
          reject(request.status);
          console.error('Ошибка', request.response)
      }
    });
        request.setRequestHeader('Access-Control-Allow-Origin', '*');
        request.setRequestHeader('Access-Control-Allow-Credentials', 'true');
        request.send();

  };

  
  function renderTempate(data, page) {
    let out = ``;
    if (page == 1) {
      table.innerHTML = '';
      table.appendChild(tableHeader);
      table.appendChild(tableHeaderMobile);
    }
    
    for (let i = 0; i < data.length; i++) {
      let tr = document.createElement('tr');
      if (window.screen.width >= 1440){
        out = `
          <td class="img"><img src="${data[i].img}" alt="img"></td>
          <td>${data[i].rooms}-комнатная №${data[i].apartment}</td>
          <td>${data[i].square}</td>
          <td>${data[i].floor} из <span>${data[i].total_floors}</span></td>
          <td>${data[i].price}</td>
      `
      } else {
      out = `
          
        <td colspan="3">
          <div>
            <div>${data[i].rooms}-комнатная №${data[i].apartment}</div>
            <div class="row">
              <div>${data[i].square}</div>
              <div>${data[i].floor} из <span class="span">${data[i].total_floors}</span></div>
              <div>${data[i].price}</div>
              <div class="img"><img src="${data[i].img}" alt="img"></div>
            </div>
          </div>
        </td>
      `
      }
      tr.innerHTML = out;
      table.appendChild(tr);
    }
  }

  noUiSlider.create(priceRangeSlider, {
      start: [5500000, 18900000],
      connect: true,
      range: {
          'min': 1000000,
          'max': 30000000
      }
  });

  noUiSlider.create(squareRangeSlider, {
    start: [33, 123],
    connect: true,
    range: {
        'min': 0,
        'max': 200
    }
});

  let priceRangeValues = [
    priceRange.querySelector('.from'), // 0
    priceRange.querySelector('.to')  // 1
  ];

  priceRangeSlider.noUiSlider.on('update', function (values, handle, unencoded, isTap, positions) {
    priceRangeValues[handle].innerHTML = values[handle];
    let url = "";
    url += "&price_gte=" + values[0];
    url += "&price_lte=" + values[1];
  
    page = 1;
    showMore.style.display = "block";
    filtersBlock.classList.toggle("disabledbutton");
    getData(url, page, get_callback);
    filtersBlock.classList.toggle("disabledbutton");
    restBtn.style.visibility = 'visible';
  });

  let squareRangeValues = [
    squareRange.querySelector('.from'), // 0
    squareRange.querySelector('.to')  // 1
  ];

  squareRangeSlider.noUiSlider.on('update', function (values, handle, unencoded, isTap, positions) {
    squareRangeValues[handle].innerHTML = values[handle];
    let url = "";
    url += "&square_gte=" + values[0];
    url += "&square_lte=" + values[1];
  
    page = 1;
    showMore.style.display = "block";
    filtersBlock.classList.toggle("disabledbutton");
    getData(url, page, get_callback);
    filtersBlock.classList.toggle("disabledbutton");
    restBtn.style.visibility = 'visible';
  });



  function get_callback(data){
    apartments = JSON.parse(data);
    renderTempate(apartments, page);
  }

  getData("", 1 , get_callback);


  for (let i = 0; i < filterRoomBtn.length; i++) {
    filterRoomBtn[i].addEventListener("click", function(e) {
      let url = "";
      url = "&rooms=" + e.target.getAttribute('id')
      page = 1;
      showMore.style.display = "block";
      filtersBlock.classList.toggle("disabledbutton");
      filterRoomBtn.forEach(elem => elem.classList.remove("selected") )
      e.target.classList.add("selected");
      getData(url, page, get_callback);
      filtersBlock.classList.toggle("disabledbutton");
      restBtn.style.visibility = 'visible';
    })
  };

  restBtn.addEventListener('click', function() {
    page = 1;
    filterRoomBtn.forEach(elem => elem.classList.remove("selected") )

    showMore.style.display = "block";
    getData("", page, get_callback);
    restBtn.style.visibility = 'hidden';
  })

  showMore.addEventListener('click', function() {
    page++;
    getData("", page, get_callback);
    restBtn.style.visibility = 'hidden';
  })


  // button toTop
  function scrollTo(to, duration = 700) {
    const
        element = document.scrollingElement || document.documentElement,
        start = element.scrollTop,
        change = to - start,
        startDate = +new Date(),
        // t = current time
        // b = start value
        // c = change in value
        // d = duration
        easeInOutQuad = function (t, b, c, d) {
            t /= d / 2;
            if (t < 1) return c / 2 * t * t + b;
            t--;
            return -c / 2 * (t * (t - 2) - 1) + b;
        },
        animateScroll = function () {
            const currentDate = +new Date();
            const currentTime = currentDate - startDate;
            element.scrollTop = parseInt(easeInOutQuad(currentTime, start, change, duration));
            if (currentTime < duration) {
                requestAnimationFrame(animateScroll);
            }
            else {
                element.scrollTop = to;
            }
        };
    animateScroll();
  }


    let toTopBtn = document.querySelector('#toTop');
    window.addEventListener('scroll', function () {
        if (scrollY > 100) {
          toTopBtn.classList.add('show');
        } else {
          toTopBtn.classList.remove('show');
        }
    });

    toTopBtn.onclick = function (click) {
        click.preventDefault();
        scrollTo(0, 400);
    }
});