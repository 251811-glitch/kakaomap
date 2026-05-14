let map;
let placesService;
let markers = [];

// 1. 카카오맵 SDK 로드 대기
kakao.maps.load(function() {
    const container = document.getElementById('map');
    const options = {
        center: new kakao.maps.LatLng(37.566826, 126.9786567), // 기본 좌표
        level: 5 // 확대 레벨
    };

    // 지도 객체 생성
    map = new kakao.maps.Map(container, options);
    
    // 장소 검색 서비스 객체 생성
    placesService = new kakao.maps.services.Places();

    // 현재 위치 가져오기 실행
    initCurrentLocation();
});

// 2. 접속 시 현재 위치 권한 요청 함수
function initCurrentLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            const currentPos = new kakao.maps.LatLng(lat, lon);

            map.setCenter(currentPos); // 지도 중심 이동
            
            // 내 위치 마커 표시
            new kakao.maps.Marker({
                map: map,
                position: currentPos
            });
        });
    }
}

// 3. 검색 버튼 클릭 시 실행되는 함수
function searchPlaces() {
    const keyword = document.getElementById('keyword').value;

    if (!keyword.replace(/^\s+|\s+$/g, '')) {
        alert('검색어를 입력해주세요!');
        return;
    }

    // 카카오 검색 서비스로 키워드 검색 요청
    placesService.keywordSearch(keyword, (data, status) => {
        if (status === kakao.maps.services.Status.OK) {
            displayPlacesList(data);
            displayMarkers(data);
        } else {
            alert('검색 결과가 없습니다.');
        }
    });
}

// 4. 왼쪽 리스트에 결과 출력
function displayPlacesList(places) {
    const listEl = document.getElementById('places-list');
    listEl.innerHTML = '';

    places.forEach(place => {
        const li = document.createElement('li');
        li.className = 'place-item';
        li.innerHTML = `
            <h4>${place.place_name}</h4>
            <p>${place.address_name}</p>
        `;
        
        li.onclick = () => {
            const movePos = new kakao.maps.LatLng(place.y, place.x);
            map.panTo(movePos); // 클릭한 장소로 부드럽게 이동
        };

        listEl.appendChild(li);
    });
}

// 5. 지도에 검색 결과 마커 표시
function displayMarkers(places) {
    removeMarkers();
    const bounds = new kakao.maps.LatLngBounds();

    places.forEach(place => {
        const position = new kakao.maps.LatLng(place.y, place.x);
        const marker = new kakao.maps.Marker({
            position: position,
            map: map
        });

        markers.push(marker);
        bounds.extend(position);
    });

    map.setBounds(bounds); // 모든 마커가 보이게 지도 범위 조정
}

// 기존 마커 삭제 함수
function removeMarkers() {
    markers.forEach(m => m.setMap(null));
    markers = [];
}