// When the DOM loads.
$(function() {
	const autoCompleteTags = [];

	// Event listeners for multiple same buttons on the document.
	$(document)
		.on('click', '.page-btn:not(.current-page)', function() {
			currentPage.removeClass('current-page');
			currentPage = $(this);
			currentPage.addClass('current-page');
			loadPage($(this).text());
		})
		.on('click', '.rating-btn', function() {
			// From the same row as the button.
			const businessName = $(this).parent().siblings(':first-child').text();
			const businessAddress = $(this).parent().siblings(':nth-child(2)').text();

			$.getJSON('https://www.cs.kent.ac.uk/people/staff/sm951/co539/assessment2/rating.php', { name: businessName }, function(ratings) {
				const business = ratings.find(function(business) {
					return businessAddress.substr(0, businessAddress.indexOf(',')) === business['vicinity'].substr(0, business['vicinity'].indexOf(','));
				});

				if (business === undefined) {
					popup('No rating found for ' + businessName + (businessAddress !== ', ' ? ' at ' + businessAddress : '') + '.');
				}
				else {
					popup('Rating for ' + businessName + ' at ' + businessAddress + ' is', business.rating + ' / 5');
				}		
			});
		});

	// Event listener for close popup button.
	$('#popup-close').on('click', function() {
		$('#dark-bg').fadeOut(100);
	});

	// When the search form is submitted.
	$('#search-form').submit(function() {
		$.getJSON('https://www.cs.kent.ac.uk/people/staff/sm951/co539/assessment2/hygiene.php', { operation: 'search', name: $('#search-input').val()}, function(results) {
			clearTable();
			$.each(results, function(i, result) {
				addEntry(result);
			});
		});
	});

	$('#search-input').autocomplete({ source: autoCompleteTags });

	/**
	 * Adds the given business as an entry in the table.
	 * @param business A JSON object representing the business.
	 */
	function addEntry(business) {
		$('#ratings-table').append(
			'<tr>' +
				'<td>' + business.name + '</td>' +
				'<td>' + business.addressLine + '</td>' +
				'<td>' + business.hygieneRating + '</td>' +
				'<td>' + business.ratingDate + '</td>' +
				'<td><button class="rating-btn btn">Get Rating</button></td>' +
			'</tr>'
		);
	}

	/**
	 * Fills the table from data from the given page.
	 * @param pageNum The page number.
	 */
	function loadPage(pageNum) {
		clearTable();

		// Temporary row to notify the user that data is now being retrieved.
		$('#ratings-table').append('<tr id="retrieving-data"><td colspan="5">Retrieving data...</td></tr>');

		$.getJSON('https://www.cs.kent.ac.uk/people/staff/sm951/co539/assessment2/hygiene.php', { operation: 'get', page: pageNum }, function(results) {
			clearTable();
			$.each(results, function(i, result) {
				addEntry(result);
				if (autoCompleteTags.indexOf(result.name) === -1) {
					autoCompleteTags.push(result.name);
				}		
			});
		});
	}

	/**
	 * Shows a popup on screen with some text, big and small, to show emphasis.
	 * @param text The regular text.
	 * @param bigText The larger text.
	 */
	function popup(text, bigText = '') {
		$('#popup-text').text(text);
		$('#popup-text-big').text(bigText);
		$('#dark-bg').fadeIn(100);
	}

	/**
	 * Clears all but the first row of the table.
	 */
	function clearTable() {
		$('#ratings-table tr:not(:first-child)').remove();
	}

	// Load page numbers.
	$.getJSON('https://www.cs.kent.ac.uk/people/staff/sm951/co539/assessment2/hygiene.php', { operation: 'pages' }, function(pagesCount) {
		pagesCount = pagesCount.pages; // No need to keep the object itself; may as well be reassigned.
		const pagesDiv = $('#pages');

		// Create first page button including current-page class.
		currentPage = $('<button/>', { 'html': 1, 'class': 'page-btn btn current-page' });
		pagesDiv.append(currentPage);

		// Create the rest of the page buttons.
		for (let i = 2; i <= pagesCount; ++i) {
			pagesDiv.append($('<button/>', { 'html': i, 'class': 'page-btn btn'}));
		}
	});

	// Load first page of results.
	loadPage(1);
});