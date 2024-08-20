document.addEventListener('DOMContentLoaded', function() {
    // Create table of contents
    const toc = document.createElement('div');
    toc.id = 'toc';
    toc.innerHTML = '<h2>Table of Contents</h2><ul></ul>';
    
    // Find all acceptance criteria headers
    const headers = document.querySelectorAll('h3');
    
    headers.forEach((header, index) => {
        // Number the headers
        header.textContent = `Acceptance Criteria ${index + 1}: ${header.textContent}`;
        
        // Add to table of contents
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = `#${header.id}`;
        a.textContent = header.textContent;
        li.appendChild(a);
        toc.querySelector('ul').appendChild(li);
        
        // Add id to header if it doesn't have one
        if (!header.id) {
            header.id = `ac-${index + 1}`;
        }
    });
    
    // Insert table of contents after the main header
    const mainHeader = document.querySelector('h1');
    mainHeader.parentNode.insertBefore(toc, mainHeader.nextSibling);
    
    // Add a back to top link after each criterion
    const criteria = document.querySelectorAll('.criterion');
    criteria.forEach((criterion) => {
        const backToTop = document.createElement('a');
        backToTop.href = '#toc';
        backToTop.textContent = 'Back to Top';
        backToTop.className = 'back-to-top';
        criterion.appendChild(backToTop);
    });
});
